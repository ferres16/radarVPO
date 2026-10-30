import * as https from 'node:https';
import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CourseStatus,
  LessonStatus,
  Prisma,
  PurchaseStatus,
  SubscriptionStatus,
  UserPlan,
} from '@prisma/client';
import type Stripe from 'stripe';
import {
  GUIDE_VPO_PUBLIC_DESCRIPTION,
  isGuideVpoSlug,
  publicCourseProductName,
} from '../common/guide-vpo';
import { isInternalCatalogCourse } from '../common/public-courses';
import { resolvePublicSiteUrl } from '../common/public-site-url';
import { CommerceService } from '../commerce/commerce.service';
import { PromoRulesService } from '../commerce/promo-rules.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import {
  buildBillingSummary,
  formatMadridDate,
} from '../notifications/message-vars';
import {
  amountToCents,
  centsToAmount,
  DEFAULT_PRO_PRICE_CENTS,
  extractSubscriptionPeriod,
  formatEuroAmount,
  isMissingStripeCustomerError,
  isOneOffPurchasableAccessType,
  isStripeTaxNotEnabledError,
  operatorStripeCheckoutMessage,
  publicStripeCheckoutMessage,
  mapStripeSubscriptionStatus,
  MIN_PUBLISHED_LESSONS_TO_SELL,
  parseCheckoutMetadata,
  PRO_PLAN_KEY,
  shouldKeepProPlan,
  stripeKeyMode,
} from './stripe-fulfillment';
import {
  CONTENT_SUPPLY_START_CRITERION,
  CONTRACT_TERMS_TEXT,
  CONTRACT_TERMS_VERSION,
  immediateConsentForProduct,
} from './contract-consent';

function getSubscriptionPeriodEnd(subscription: {
  current_period_end?: number;
  items?: { data?: Array<{ current_period_end?: number }> };
}): number | undefined {
  return (
    subscription.current_period_end ??
    subscription.items?.data?.[0]?.current_period_end
  );
}

const ACTIVE_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  SubscriptionStatus.active,
  SubscriptionStatus.trialing,
];

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private stripeClient: Stripe | null | undefined;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
    private readonly commerce: CommerceService,
    private readonly promoRules: PromoRulesService,
  ) {}

  // ---------------------------------------------------------------------------
  // Stripe client / configuración
  // ---------------------------------------------------------------------------

  private stripeSecretKey(): string | null {
    const raw = this.config.get<string>('STRIPE_SECRET_KEY')?.trim();
    if (!raw) return null;
    return raw.replace(/^['"]|['"]$/g, '').trim() || null;
  }

  private async getStripe(): Promise<Stripe | null> {
    if (this.stripeClient !== undefined) {
      return this.stripeClient;
    }
    const secretKey = this.stripeSecretKey();
    if (!secretKey) {
      this.stripeClient = null;
      return null;
    }
    const StripeCtor = (await import('stripe')).default;
    // IPv4: en Railway el agente HTTPS por defecto (happy eyeballs / IPv6)
    // acaba en StripeConnectionError tras 2 reintentos, y la clave live
    // nunca aparece como “utilizada” en el Dashboard.
    this.stripeClient = new StripeCtor(secretKey, {
      timeout: 20_000,
      maxNetworkRetries: 2,
      telemetry: false,
      httpAgent: new https.Agent({ keepAlive: true, family: 4 }),
    });
    return this.stripeClient;
  }

  async getStripeStatus(): Promise<{
    configured: boolean;
    webhookConfigured: boolean;
    keyMode: ReturnType<typeof stripeKeyMode>;
    reachable: boolean;
    error: string | null;
    chargesEnabled: boolean | null;
    payoutsEnabled: boolean | null;
    detailsSubmitted: boolean | null;
    currentlyDue: string[];
    pastDue: string[];
    disabledReason: string | null;
  }> {
    const secretKey = this.stripeSecretKey();
    const webhookConfigured = Boolean(
      this.config.get<string>('STRIPE_WEBHOOK_SECRET')?.trim(),
    );
    const keyMode = stripeKeyMode(secretKey);

    if (!secretKey) {
      return {
        configured: false,
        webhookConfigured,
        keyMode,
        reachable: false,
        error: 'Falta STRIPE_SECRET_KEY en Railway.',
        chargesEnabled: null,
        payoutsEnabled: null,
        detailsSubmitted: null,
        currentlyDue: [],
        pastDue: [],
        disabledReason: null,
      };
    }

    try {
      const stripe = await this.getStripe();
      if (!stripe) {
        throw new Error('Stripe client missing');
      }
      const account = await stripe.accounts.retrieve();
      const requirements = account.requirements;
      return {
        configured: true,
        webhookConfigured,
        keyMode,
        reachable: true,
        error: null,
        chargesEnabled: Boolean(account.charges_enabled),
        payoutsEnabled: Boolean(account.payouts_enabled),
        detailsSubmitted: Boolean(account.details_submitted),
        currentlyDue: requirements?.currently_due ?? [],
        pastDue: requirements?.past_due ?? [],
        disabledReason: requirements?.disabled_reason ?? null,
      };
    } catch (error) {
      return {
        configured: true,
        webhookConfigured,
        keyMode,
        reachable: false,
        error: operatorStripeCheckoutMessage(error),
        chargesEnabled: null,
        payoutsEnabled: null,
        detailsSubmitted: null,
        currentlyDue: [],
        pastDue: [],
        disabledReason: null,
      };
    }
  }

  /**
   * El pago integrado solo se ofrece si Stripe puede confirmar los pagos por webhook.
   * Sin STRIPE_WEBHOOK_SECRET no se puede activar el acceso automáticamente, así que
   * la web no debe prometer "acceso inmediato".
   */
  isCheckoutConfigured(): boolean {
    return Boolean(
      this.stripeSecretKey() &&
      this.config.get<string>('STRIPE_WEBHOOK_SECRET')?.trim(),
    );
  }

  async getCheckoutStatus() {
    const commerce = await this.commerce.getSettings();
    const pack = await this.promoRules.getProPack3m();
    const stripeReady = this.isCheckoutConfigured();
    return {
      enabled: stripeReady,
      proEnabled: stripeReady && commerce.proEnabled,
      coursesEnabled: stripeReady && commerce.coursesEnabled,
      proPackEnabled:
        stripeReady && commerce.proEnabled && Boolean(pack?.enabled),
      maintenanceMessage: commerce.maintenanceMessage,
      proPackGuideSlug: pack?.guideSlug || commerce.proPackGuideSlug,
      allowPromotionCodes: commerce.allowPromotionCodes,
      proPriceCents: this.getProPriceCents(),
      proPackPriceCents: pack?.priceCents ?? this.getProPriceCents() * 3,
      currency: 'eur',
    };
  }

  private getProPriceCents(): number {
    const raw = Number(this.config.get<string>('STRIPE_PRO_PRICE_CENTS'));
    return Number.isInteger(raw) && raw > 0 ? raw : DEFAULT_PRO_PRICE_CENTS;
  }

  private withoutAutomaticTax(
    params: Stripe.Checkout.SessionCreateParams,
  ): Stripe.Checkout.SessionCreateParams {
    const next: Stripe.Checkout.SessionCreateParams = { ...params };
    delete next.automatic_tax;
    delete next.tax_id_collection;
    if (next.billing_address_collection === 'required') {
      delete next.billing_address_collection;
    }
    next.line_items = (params.line_items || []).map((item) => {
      if (!item.price_data) return item;
      const priceData = { ...item.price_data };
      delete priceData.tax_behavior;
      return { ...item, price_data: priceData };
    });
    return next;
  }

  private async createStripeCheckoutSession(
    stripe: Stripe,
    params: Stripe.Checkout.SessionCreateParams,
    user: { email: string; stripeCustomerId: string | null },
  ): Promise<Stripe.Checkout.Session> {
    try {
      return await stripe.checkout.sessions.create({
        ...params,
        payment_method_types: params.payment_method_types ?? ['card'],
      });
    } catch (error) {
      if (user.stripeCustomerId && isMissingStripeCustomerError(error)) {
        this.logger.warn(
          `Stripe customer ${user.stripeCustomerId} missing; retrying checkout with email`,
        );
        const retry: Stripe.Checkout.SessionCreateParams = {
          ...params,
          customer_email: user.email,
        };
        delete retry.customer;
        if (params.mode === 'payment') {
          retry.customer_creation = 'always';
        }
        return this.createStripeCheckoutSession(stripe, retry, {
          email: user.email,
          stripeCustomerId: null,
        });
      }
      if (params.automatic_tax?.enabled && isStripeTaxNotEnabledError(error)) {
        this.logger.warn(
          'Stripe Tax is not configured; retrying checkout without automatic_tax',
        );
        return this.createStripeCheckoutSession(
          stripe,
          this.withoutAutomaticTax(params),
          user,
        );
      }
      const stripeError = error as {
        code?: string;
        type?: string;
        message?: string;
      };
      this.logger.error(
        `Stripe checkout failed code=${stripeError.code || 'n/a'} type=${stripeError.type || 'n/a'} message=${(stripeError.message || '').slice(0, 300)}`,
      );
      throw new ServiceUnavailableException(publicStripeCheckoutMessage(error));
    }
  }

  // ---------------------------------------------------------------------------
  // Checkout (pago único de curso o suscripción PRO)
  // ---------------------------------------------------------------------------

  async createCheckoutSession(
    userId: string,
    dto: CreateCheckoutDto,
  ): Promise<{ url: string }> {
    if (!this.isCheckoutConfigured()) {
      throw new ServiceUnavailableException(
        'El pago online no está disponible en este momento.',
      );
    }
    const commerce = await this.commerce.getSettings();
    if (
      (dto.product === 'pro' || dto.product === 'pro_pack_3m') &&
      !commerce.proEnabled
    ) {
      throw new ServiceUnavailableException(commerce.maintenanceMessage);
    }
    if (dto.product === 'course' && !commerce.coursesEnabled) {
      throw new ServiceUnavailableException(commerce.maintenanceMessage);
    }
    if (dto.product === 'pro_pack_3m') {
      const pack = await this.promoRules.getProPack3m();
      if (!pack?.enabled) {
        throw new ServiceUnavailableException(
          'El pack PRO de 3 meses no está disponible ahora mismo.',
        );
      }
    }
    if (!dto.acceptedTerms) {
      throw new BadRequestException(
        'Debes aceptar las condiciones de contratación para continuar.',
      );
    }
    if (!dto.acceptedImmediateAccess) {
      throw new BadRequestException(
        'Debes confirmar el acceso inmediato al contenido y servicios digitales para continuar.',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        plan: true,
        stripeCustomerId: true,
        subscriptions: {
          where: {
            planKey: PRO_PLAN_KEY,
            status: { in: ACTIVE_SUBSCRIPTION_STATUSES },
          },
          select: { id: true },
          take: 1,
        },
      },
    });
    if (!user) {
      throw new BadRequestException('Usuario no encontrado.');
    }

    const stripe = await this.getStripe();
    if (!stripe) {
      throw new ServiceUnavailableException(
        'El pago online no está disponible en este momento.',
      );
    }

    const siteUrl = resolvePublicSiteUrl();
    const customerParams: Pick<
      Stripe.Checkout.SessionCreateParams,
      'customer' | 'customer_email'
    > = user.stripeCustomerId
      ? { customer: user.stripeCustomerId }
      : { customer_email: user.email };

    if (dto.product === 'pro' || dto.product === 'pro_pack_3m') {
      if (user.plan === UserPlan.pro || user.subscriptions.length > 0) {
        throw new BadRequestException('Ya tienes Radar VPO PRO activo.');
      }

      const isPack = dto.product === 'pro_pack_3m';
      const pack = isPack ? await this.promoRules.getProPack3m() : null;
      const unitAmount = isPack
        ? (pack?.priceCents ?? this.getProPriceCents() * 3)
        : this.getProPriceCents();
      const priceLabel = formatEuroAmount(unitAmount);
      const guideSlug =
        pack?.guideSlug || commerce.proPackGuideSlug || 'vpo-inicial';
      const nowIso = new Date().toISOString();
      const immediate = immediateConsentForProduct(
        isPack ? 'pro_pack_3m' : 'pro',
      );
      const metadata = {
        userId: user.id,
        product: isPack ? 'pro_pack_3m' : 'pro',
        ...(isPack ? { guideSlug } : {}),
        termsAcceptedAt: nowIso,
        termsVersion: CONTRACT_TERMS_VERSION,
        immediateAccessAccepted: 'true',
        immediateConsentVersion: immediate.version,
      };
      const session = await this.createStripeCheckoutSession(
        stripe,
        {
          mode: 'subscription',
          client_reference_id: user.id,
          ...customerParams,
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: 'eur',
                unit_amount: unitAmount,
                ...(commerce.stripeAutomaticTax
                  ? { tax_behavior: 'inclusive' as const }
                  : {}),
                recurring: isPack
                  ? { interval: 'month', interval_count: 3 }
                  : { interval: 'month' },
                product_data: {
                  name: isPack
                    ? 'Radar VPO PRO (pack 3 meses + guía)'
                    : 'Radar VPO PRO (suscripción mensual)',
                  description: isPack
                    ? `Avisos PRO durante 3 meses e incluye la guía ${guideSlug}.`
                    : 'Avisos por email y SMS y Mi espacio sin límite mientras la suscripción esté activa.',
                },
              },
            },
          ],
          metadata,
          subscription_data: { metadata },
          locale: 'es',
          ...(commerce.allowPromotionCodes
            ? { allow_promotion_codes: true }
            : {}),
          ...(commerce.stripeAutomaticTax
            ? {
                automatic_tax: { enabled: true },
                billing_address_collection: 'required' as const,
                tax_id_collection: { enabled: true },
              }
            : {}),
          custom_text: {
            submit: {
              message: isPack
                ? `Pack de ${priceLabel} cada 3 meses. Incluye la guía inicial. Cancelas desde Mi cuenta.`
                : `Suscripción de ${priceLabel} al mes. Se renueva cada mes hasta que la canceles desde "Mi cuenta"; mantendrás el acceso hasta el final del periodo ya pagado.`,
            },
          },
          success_url: `${siteUrl}/gracias?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${siteUrl}/pro?canceled=1#pagar`,
        },
        user,
      );

      if (!session.url) {
        throw new ServiceUnavailableException(
          'No se pudo iniciar el pago. Inténtalo de nuevo.',
        );
      }
      await this.createPendingPurchaseConsent({
        userId: user.id,
        stripeSessionId: session.id,
        productKey: isPack ? 'pro_pack_3m' : 'pro',
        courseId: null,
        immediateVersion: immediate.version,
        immediateText: immediate.text,
      });
      return { url: session.url };
    }

    // Curso de pago único
    if (!dto.courseSlug) {
      throw new BadRequestException('Falta indicar el curso.');
    }
    const course = await this.prisma.course.findUnique({
      where: { slug: dto.courseSlug },
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        currency: true,
        status: true,
        pricingType: true,
        accessType: true,
        format: true,
        guidePdfAssetId: true,
        _count: {
          select: { lessons: { where: { status: LessonStatus.published } } },
        },
      },
    });
    if (
      !course ||
      course.status !== CourseStatus.published ||
      isInternalCatalogCourse(course)
    ) {
      throw new BadRequestException('Curso no disponible.');
    }
    const isGuide = course.format === 'guide_pdf';
    if (isGuide && !course.guidePdfAssetId) {
      throw new BadRequestException(
        'Esta guía todavía no tiene el PDF publicado y no se puede comprar.',
      );
    }
    if (!isGuide && course._count.lessons < MIN_PUBLISHED_LESSONS_TO_SELL) {
      throw new BadRequestException(
        'Este curso todavía está en preparación y no se puede comprar.',
      );
    }
    const unitAmount = course.price ? amountToCents(course.price) : null;
    if (
      !unitAmount ||
      course.pricingType !== 'premium' ||
      (course.currency && course.currency.toLowerCase() !== 'eur') ||
      !isOneOffPurchasableAccessType(course.accessType)
    ) {
      throw new BadRequestException('Este curso no está a la venta.');
    }

    const alreadyOwned = await this.prisma.userCourseAccess.findFirst({
      where: { userId: user.id, courseId: course.id, isActive: true },
      select: { id: true },
    });
    if (alreadyOwned) {
      throw new BadRequestException('Ya tienes acceso a este curso.');
    }

    const nowIso = new Date().toISOString();
    const immediate = immediateConsentForProduct('course');
    const metadata = {
      userId: user.id,
      product: 'course',
      courseId: course.id,
      courseSlug: course.slug,
      termsAcceptedAt: nowIso,
      termsVersion: CONTRACT_TERMS_VERSION,
      immediateAccessAccepted: 'true',
      immediateConsentVersion: immediate.version,
    };
    const session = await this.createStripeCheckoutSession(
      stripe,
      {
        mode: 'payment',
        client_reference_id: user.id,
        ...customerParams,
        ...(user.stripeCustomerId
          ? {}
          : { customer_creation: 'always' as const }),
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'eur',
              unit_amount: unitAmount,
              ...(commerce.stripeAutomaticTax
                ? { tax_behavior: 'inclusive' as const }
                : {}),
              product_data: {
                name: publicCourseProductName(course),
                ...(isGuideVpoSlug(course.slug)
                  ? {
                      images: [`${siteUrl}/covers/guia-vpo.png`],
                      description: GUIDE_VPO_PUBLIC_DESCRIPTION,
                    }
                  : {}),
              },
            },
          },
        ],
        metadata,
        payment_intent_data: {
          metadata,
          description: publicCourseProductName(course),
        },
        locale: 'es',
        ...(commerce.allowPromotionCodes
          ? { allow_promotion_codes: true }
          : {}),
        ...(commerce.stripeAutomaticTax
          ? {
              automatic_tax: { enabled: true },
              billing_address_collection: 'required' as const,
              tax_id_collection: { enabled: true },
            }
          : {}),
        custom_text: {
          submit: {
            message: `Pago único de ${formatEuroAmount(unitAmount)}. Sin renovaciones. Acceso inmediato al contenido tras confirmarse el pago.`,
          },
        },
        success_url: `${siteUrl}/gracias?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/cursos/${course.slug}?canceled=1#pagar`,
      },
      user,
    );

    if (!session.url) {
      throw new ServiceUnavailableException(
        'No se pudo iniciar el pago. Inténtalo de nuevo.',
      );
    }
    await this.createPendingPurchaseConsent({
      userId: user.id,
      stripeSessionId: session.id,
      productKey: `course:${course.slug}`,
      courseId: course.id,
      immediateVersion: immediate.version,
      immediateText: immediate.text,
    });
    return { url: session.url };
  }

  // ---------------------------------------------------------------------------
  // Webhook de Stripe
  // ---------------------------------------------------------------------------

  async handleWebhook(
    rawBody: Buffer | undefined,
    signature: string | undefined,
  ) {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    const stripe = await this.getStripe();
    if (!stripe || !webhookSecret) {
      throw new ServiceUnavailableException('Webhook no configurado.');
    }
    if (!rawBody || !signature) {
      throw new BadRequestException('Firma de webhook ausente.');
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Firma de webhook no válida.');
    }

    // Claim atómico por evt_… (unique PK). Si ya está processed → duplicate.
    // Si falló antes, se puede reclamar para reintentar el fulfill.
    const existing = await this.prisma.stripeProcessedEvent.findUnique({
      where: { eventId: event.id },
      select: { status: true },
    });
    if (existing?.status === 'processed') {
      return { received: true, duplicate: true };
    }
    if (existing?.status === 'processing') {
      // Otro worker lo está tratando ahora.
      return { received: true, duplicate: true };
    }
    if (existing?.status === 'failed') {
      await this.prisma.stripeProcessedEvent.delete({
        where: { eventId: event.id },
      });
    }

    try {
      await this.prisma.stripeProcessedEvent.create({
        data: {
          eventId: event.id,
          type: event.type,
          status: 'processing',
        },
      });
    } catch {
      return { received: true, duplicate: true };
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
        case 'checkout.session.async_payment_succeeded':
          await this.fulfillCheckoutSession(stripe, event.data.object);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await this.syncSubscription(event.data.object);
          break;
        case 'charge.refunded':
          await this.handleChargeRefunded(event.data.object);
          break;
        default:
          break;
      }

      await this.prisma.stripeProcessedEvent.update({
        where: { eventId: event.id },
        data: {
          status: 'processed',
          processedAt: new Date(),
          errorMessage: null,
        },
      });
      try {
        await this.prisma.auditLog.create({
          data: {
            action: 'stripe.webhook.processed',
            entity: 'StripeEvent',
            entityId: event.id,
            metadata: { type: event.type },
          },
        });
      } catch (error) {
        // Índice único parcial en main (entity=StripeEvent): carrera benigna.
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          return { received: true, duplicate: true };
        }
        throw error;
      }
      return { received: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message.slice(0, 500) : 'webhook_failed';
      await this.prisma.stripeProcessedEvent.update({
        where: { eventId: event.id },
        data: { status: 'failed', errorMessage: message },
      });
      throw error;
    }
  }

  private async fulfillCheckoutSession(
    stripe: Stripe,
    session: Stripe.Checkout.Session,
  ) {
    if (session.payment_status === 'unpaid') {
      // Pago diferido (p. ej. transferencia): se completará con async_payment_succeeded.
      return;
    }

    const meta = parseCheckoutMetadata(
      session.metadata,
      session.client_reference_id,
    );
    if (!meta) {
      this.logger.warn(`Checkout ${session.id} ignored: missing metadata`);
      return;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: meta.userId },
      select: { id: true, email: true, fullName: true, stripeCustomerId: true },
    });
    if (!user) {
      this.logger.warn(`Checkout ${session.id}: user ${meta.userId} not found`);
      return;
    }
    const siteUrl = resolvePublicSiteUrl();
    const displayName = user.fullName?.trim() || user.email;

    const customerId =
      typeof session.customer === 'string'
        ? session.customer
        : (session.customer?.id ?? null);
    if (customerId && !user.stripeCustomerId) {
      const taken = await this.prisma.user.findFirst({
        where: { stripeCustomerId: customerId, id: { not: user.id } },
        select: { id: true },
      });
      if (!taken) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId: customerId },
        });
      }
    }

    if (meta.product === 'course' && meta.courseId) {
      const paymentIntentId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : (session.payment_intent?.id ?? null);
      const providerRef = paymentIntentId ?? session.id;

      const existing = await this.prisma.purchase.findFirst({
        where: { provider: 'stripe', providerRef },
        select: { id: true },
      });
      if (!existing) {
        await this.prisma.purchase.create({
          data: {
            userId: user.id,
            courseId: meta.courseId,
            provider: 'stripe',
            providerRef,
            productKey: `course:${meta.courseSlug ?? meta.courseId}`,
            status: PurchaseStatus.paid,
            amount: centsToAmount(session.amount_total),
            currency: (session.currency ?? 'eur').toUpperCase(),
            purchasedAt: new Date(),
          },
        });
      }

      await this.prisma.userCourseAccess.upsert({
        where: {
          userId_courseId: { userId: user.id, courseId: meta.courseId },
        },
        update: {
          isActive: true,
          notes: `Stripe checkout ${session.id}`,
        },
        create: {
          userId: user.id,
          courseId: meta.courseId,
          isActive: true,
          activatedByAdmin: false,
          notes: `Stripe checkout ${session.id}`,
        },
      });
      const course = await this.prisma.course.findUnique({
        where: { id: meta.courseId },
        select: { title: true, slug: true },
      });
      const courseTitle = course?.title || 'tu compra';
      const courseUrl = `${siteUrl}/cursos/${course?.slug || meta.courseSlug || ''}`;
      const purchase = await this.prisma.purchase.findFirst({
        where: { provider: 'stripe', providerRef },
        select: { id: true },
      });
      const consent = await this.markConsentFulfilled({
        stripeSessionId: session.id,
        userId: user.id,
        purchaseId: purchase?.id ?? null,
        accessGranted: true,
      });
      const consentBlock = this.formatConsentEmailBlock(consent);
      const purchaseRef = purchase?.id ?? session.id;
      if (!course?.slug && !meta.courseSlug) {
        this.logger.warn(
          `purchase.course email skipped: missing course slug for ${session.id}`,
        );
        await this.markConfirmationEmail(session.id, 'skipped', 'missing_slug');
      } else {
        await this.sendPurchaseConfirmationOnce({
          stripeSessionId: session.id,
          templateKey: 'purchase.course',
          toEmail: user.email,
          toName: displayName,
          vars: {
            name: displayName,
            email: user.email,
            product: courseTitle,
            url: courseUrl,
            title: courseTitle,
            location: '',
            date: '',
            price: formatEuroAmount(session.amount_total ?? 0),
            phone: '',
            access_until: 'Acceso mínimo 24 meses desde la compra (según condiciones).',
            billing_summary: buildBillingSummary({
              kind: 'course',
              amountCents: session.amount_total ?? 0,
            }),
            purchase_ref: purchaseRef,
            consent_summary: consentBlock,
            contract_version: consent?.termsVersion ?? CONTRACT_TERMS_VERSION,
          },
          requiredVars: ['product', 'url', 'price', 'consent_summary'],
          fallbackSubject: `Confirmación de compra: ${courseTitle}`,
          fallbackHtml: `<p>Hola,</p><p>Compra confirmada: ${courseTitle} (${formatEuroAmount(session.amount_total ?? 0)}). Ref. ${purchaseRef}.</p><p>${consentBlock}</p><p><a href="${courseUrl}">Acceder</a></p><p>Versión contractual: ${consent?.termsVersion ?? CONTRACT_TERMS_VERSION}</p>`,
        });
      }
      return;
    }

    if (meta.product === 'pro' || meta.product === 'pro_pack_3m') {
      const subscriptionId =
        typeof session.subscription === 'string'
          ? session.subscription
          : (session.subscription?.id ?? null);
      if (!subscriptionId) return;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await this.syncSubscription(subscription, user.id);

      let guideTitle = 'guía inicial';
      let guideUrl = `${siteUrl}/cursos`;
      if (meta.product === 'pro_pack_3m') {
        const guideSlug =
          meta.guideSlug ||
          (await this.promoRules.getProPack3m())?.guideSlug ||
          'vpo-inicial';
        const guide = await this.prisma.course.findUnique({
          where: { slug: guideSlug },
          select: { id: true, title: true, slug: true },
        });
        if (guide) {
          guideTitle = guide.title;
          guideUrl = `${siteUrl}/cursos/${guide.slug}`;
          await this.prisma.userCourseAccess.upsert({
            where: {
              userId_courseId: { userId: user.id, courseId: guide.id },
            },
            update: {
              isActive: true,
              notes: `Pack PRO 3 meses (${session.id})`,
            },
            create: {
              userId: user.id,
              courseId: guide.id,
              isActive: true,
              activatedByAdmin: false,
              notes: `Pack PRO 3 meses (${session.id})`,
            },
          });
        }
      }

      const period = extractSubscriptionPeriod(subscription);
      const accessUntil = formatMadridDate(period.end);
      const isPack = meta.product === 'pro_pack_3m';
      const renews = !subscription.cancel_at_period_end;
      const consent = await this.markConsentFulfilled({
        stripeSessionId: session.id,
        userId: user.id,
        purchaseId: null,
        accessGranted: true,
      });
      const consentBlock = this.formatConsentEmailBlock(consent);
      const productLabel = isPack
        ? `Radar VPO PRO (pack 3 meses)${guideTitle ? ` + ${guideTitle}` : ''}`
        : 'Radar VPO PRO (suscripción mensual)';
      await this.sendPurchaseConfirmationOnce({
        stripeSessionId: session.id,
        templateKey: isPack ? 'purchase.pro_pack' : 'purchase.pro',
        toEmail: user.email,
        toName: displayName,
        vars: {
          name: displayName,
          email: user.email,
          product: productLabel,
          url: isPack ? guideUrl : `${siteUrl}/account`,
          title: 'Radar VPO PRO',
          location: '',
          date: accessUntil,
          price: formatEuroAmount(session.amount_total ?? 0),
          phone: '',
          access_until: accessUntil,
          billing_summary: buildBillingSummary({
            kind: isPack ? 'pro_pack_3m' : 'pro_monthly',
            amountCents: session.amount_total ?? 0,
            accessUntil,
            renews,
          }),
          purchase_ref: session.id,
          consent_summary: consentBlock,
          contract_version: consent?.termsVersion ?? CONTRACT_TERMS_VERSION,
          cancel_hint:
            'Puedes cancelar la renovación desde Mi cuenta; conservarás el acceso hasta el final del periodo ya pagado. El desistimiento y los reembolsos por incidencia se gestionan por separado escribiendo a soporte.',
        },
        requiredVars: ['url', 'billing_summary', 'consent_summary'],
        fallbackSubject: isPack
          ? 'Confirmación: pack PRO de tres meses'
          : 'Confirmación: Radar VPO PRO',
        fallbackHtml: `<p>Hola,</p><p>${productLabel} confirmado (${formatEuroAmount(session.amount_total ?? 0)}). Ref. ${session.id}.</p><p>Acceso hasta ${accessUntil || 'el final del periodo pagado'}.</p><p>${consentBlock}</p><p><a href="${siteUrl}/account">Mi cuenta</a></p><p>Versión contractual: ${consent?.termsVersion ?? CONTRACT_TERMS_VERSION}</p>`,
      });
    }
  }

  private async createPendingPurchaseConsent(input: {
    userId: string;
    stripeSessionId: string;
    productKey: string;
    courseId: string | null;
    immediateVersion: string;
    immediateText: string;
  }) {
    const now = new Date();
    await this.prisma.purchaseConsent.upsert({
      where: { stripeSessionId: input.stripeSessionId },
      create: {
        userId: input.userId,
        stripeSessionId: input.stripeSessionId,
        productKey: input.productKey,
        courseId: input.courseId,
        termsVersion: CONTRACT_TERMS_VERSION,
        termsTextSnapshot: CONTRACT_TERMS_TEXT,
        termsAcceptedAt: now,
        immediateConsentVersion: input.immediateVersion,
        immediateTextSnapshot: input.immediateText,
        immediateAcceptedAt: now,
        confirmationEmailStatus: 'pending',
      },
      update: {
        productKey: input.productKey,
        courseId: input.courseId,
        termsVersion: CONTRACT_TERMS_VERSION,
        termsTextSnapshot: CONTRACT_TERMS_TEXT,
        immediateConsentVersion: input.immediateVersion,
        immediateTextSnapshot: input.immediateText,
        immediateAcceptedAt: now,
      },
    });
    await this.prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: 'billing.checkout.consent_recorded',
        entity: 'PurchaseConsent',
        entityId: input.stripeSessionId,
        metadata: {
          productKey: input.productKey,
          termsVersion: CONTRACT_TERMS_VERSION,
          immediateConsentVersion: input.immediateVersion,
        },
      },
    });
  }

  private async markConsentFulfilled(input: {
    stripeSessionId: string;
    userId: string;
    purchaseId: string | null;
    accessGranted: boolean;
  }) {
    const existing = await this.prisma.purchaseConsent.findUnique({
      where: { stripeSessionId: input.stripeSessionId },
    });
    if (!existing) {
      return this.prisma.purchaseConsent.create({
        data: {
          userId: input.userId,
          stripeSessionId: input.stripeSessionId,
          purchaseId: input.purchaseId,
          productKey: 'unknown',
          termsVersion: CONTRACT_TERMS_VERSION,
          termsTextSnapshot: CONTRACT_TERMS_TEXT,
          termsAcceptedAt: new Date(),
          accessGrantedAt: input.accessGranted ? new Date() : null,
          confirmationEmailStatus: 'pending',
        },
      });
    }
    return this.prisma.purchaseConsent.update({
      where: { id: existing.id },
      data: {
        purchaseId: input.purchaseId ?? existing.purchaseId,
        accessGrantedAt:
          input.accessGranted && !existing.accessGrantedAt
            ? new Date()
            : existing.accessGrantedAt,
      },
    });
  }

  private formatConsentEmailBlock(
    consent: {
      termsVersion: string;
      termsTextSnapshot: string;
      termsAcceptedAt: Date;
      immediateConsentVersion: string | null;
      immediateTextSnapshot: string | null;
      immediateAcceptedAt: Date | null;
    } | null,
  ) {
    if (!consent) {
      return 'Consentimiento: no consta snapshot en servidor para esta sesión (revisar logs).';
    }
    const termsAt = consent.termsAcceptedAt.toISOString();
    const lines = [
      `Condiciones aceptadas (${consent.termsVersion}) el ${termsAt}: «${consent.termsTextSnapshot}»`,
    ];
    if (consent.immediateTextSnapshot && consent.immediateAcceptedAt) {
      lines.push(
        `Suministro/inicio inmediato (${consent.immediateConsentVersion}) el ${consent.immediateAcceptedAt.toISOString()}: «${consent.immediateTextSnapshot}»`,
      );
    }
    return lines.join(' ');
  }

  private async markConfirmationEmail(
    stripeSessionId: string,
    status: 'sent' | 'failed' | 'skipped',
    error?: string,
  ) {
    await this.prisma.purchaseConsent.updateMany({
      where: { stripeSessionId },
      data: {
        confirmationEmailStatus: status,
        confirmationEmailSentAt: status === 'sent' ? new Date() : undefined,
        confirmationEmailError: error?.slice(0, 2000) ?? null,
      },
    });
  }

  private async sendPurchaseConfirmationOnce(input: {
    stripeSessionId: string;
    templateKey: string;
    toEmail: string;
    toName: string;
    vars: Record<string, string>;
    requiredVars: string[];
    fallbackSubject: string;
    fallbackHtml: string;
  }) {
    const consent = await this.prisma.purchaseConsent.findUnique({
      where: { stripeSessionId: input.stripeSessionId },
      select: { confirmationEmailStatus: true },
    });
    if (consent?.confirmationEmailStatus === 'sent') {
      return;
    }
    try {
      const ok = await this.notifications.sendTemplatedEmail({
        templateKey: input.templateKey,
        toEmail: input.toEmail,
        toName: input.toName,
        vars: input.vars,
        requiredVars: input.requiredVars,
        fallbackSubject: input.fallbackSubject,
        fallbackHtml: input.fallbackHtml,
      });
      await this.markConfirmationEmail(
        input.stripeSessionId,
        ok ? 'sent' : 'failed',
        ok ? undefined : 'send_returned_false',
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'email_send_error';
      await this.markConfirmationEmail(input.stripeSessionId, 'failed', message);
    }
  }

  /**
   * Estado de una sesión de Checkout para la página /gracias.
   * No concede acceso: solo refleja Stripe + cumplimiento en BD.
   */
  async getCheckoutResult(userId: string, sessionId: string) {
    if (!sessionId?.startsWith('cs_')) {
      throw new BadRequestException('Sesión de pago no válida.');
    }
    const stripe = await this.getStripe();
    if (!stripe) {
      throw new ServiceUnavailableException('Pagos no disponibles.');
    }

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription', 'payment_intent'],
      });
    } catch {
      throw new BadRequestException('No se encontró esa sesión de pago.');
    }

    const meta = parseCheckoutMetadata(
      session.metadata,
      session.client_reference_id,
    );
    if (!meta || meta.userId !== userId) {
      throw new BadRequestException('Esta sesión no pertenece a tu cuenta.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        emailVerifiedAt: true,
        plan: true,
      },
    });

    const consent = await this.prisma.purchaseConsent.findUnique({
      where: { stripeSessionId: sessionId },
    });

    const paymentStatus = session.payment_status; // paid | unpaid | no_payment_required
    const sessionStatus = session.status; // open | complete | expired

    let product: 'pro' | 'pro_pack_3m' | 'course' =
      meta.product === 'pro_pack_3m'
        ? 'pro_pack_3m'
        : meta.product === 'course'
          ? 'course'
          : 'pro';
    let productTitle = 'Radar VPO PRO';
    let ctaHref = '/account';
    let ctaLabel = 'Ir a mi cuenta';
    let accessReady = false;

    if (product === 'course' && meta.courseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: meta.courseId },
        select: { title: true, slug: true, format: true },
      });
      productTitle = course?.title || 'Tu compra';
      if (course?.slug) {
        ctaHref = `/cursos/${course.slug}`;
        ctaLabel =
          course.format === 'guide_pdf' ? 'Ir a mi guía' : 'Ir a mi curso';
      }
      const access = await this.prisma.userCourseAccess.findFirst({
        where: {
          userId,
          courseId: meta.courseId,
          isActive: true,
        },
        select: { id: true },
      });
      accessReady = Boolean(access);
    } else {
      productTitle =
        product === 'pro_pack_3m'
          ? 'Radar VPO PRO (pack 3 meses)'
          : 'Radar VPO PRO';
      ctaHref = '/account';
      ctaLabel = 'Ir a mi cuenta';
      accessReady =
        user?.plan === UserPlan.pro ||
        Boolean(
          await this.prisma.subscription.findFirst({
            where: {
              userId,
              planKey: PRO_PLAN_KEY,
              status: { in: ACTIVE_SUBSCRIPTION_STATUSES },
            },
            select: { id: true },
          }),
        );
    }

    const paid =
      paymentStatus === 'paid' || paymentStatus === 'no_payment_required';
    const failed =
      sessionStatus === 'expired' ||
      (!paid && sessionStatus !== 'open' && paymentStatus === 'unpaid');
    const processing = paid && !accessReady && sessionStatus === 'complete';
    const confirmed = paid && accessReady;

    let uiStatus: 'confirmed' | 'processing' | 'pending' | 'failed' = 'pending';
    if (failed) uiStatus = 'failed';
    else if (confirmed) uiStatus = 'confirmed';
    else if (processing || (paid && !accessReady)) uiStatus = 'processing';
    else if (sessionStatus === 'open' || !paid) uiStatus = 'pending';

    return {
      sessionId,
      uiStatus,
      paymentStatus,
      sessionStatus,
      paid,
      accessReady,
      product,
      productTitle,
      amountTotal: session.amount_total,
      currency: (session.currency || 'eur').toUpperCase(),
      ctaHref,
      ctaLabel,
      emailVerified: Boolean(user?.emailVerifiedAt),
      email: user?.email ?? null,
      consent: consent
        ? {
            termsVersion: consent.termsVersion,
            immediateConsentVersion: consent.immediateConsentVersion,
            termsAcceptedAt: consent.termsAcceptedAt.toISOString(),
            immediateAcceptedAt:
              consent.immediateAcceptedAt?.toISOString() ?? null,
            confirmationEmailStatus: consent.confirmationEmailStatus,
            firstContentOpenedAt:
              consent.firstContentOpenedAt?.toISOString() ?? null,
            accessGrantedAt: consent.accessGrantedAt?.toISOString() ?? null,
          }
        : null,
      transactionId:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent &&
              typeof session.payment_intent === 'object' &&
              'id' in session.payment_intent
            ? String((session.payment_intent as { id: string }).id)
            : session.id,
      contentSupplyCriterion: CONTENT_SUPPLY_START_CRITERION,
    };
  }

  /** Registra apertura efectiva del contenido digital (no prueba lectura completa). */
  async recordContentSupplyStart(
    userId: string,
    input: { courseSlug: string; path?: string },
  ) {
    const course = await this.prisma.course.findUnique({
      where: { slug: input.courseSlug },
      select: { id: true, slug: true },
    });
    if (!course) {
      throw new BadRequestException('Curso no encontrado.');
    }
    const access = await this.prisma.userCourseAccess.findFirst({
      where: { userId, courseId: course.id, isActive: true },
      select: { id: true },
    });
    if (!access) {
      throw new BadRequestException('No tienes acceso activo a este contenido.');
    }

    const consent = await this.prisma.purchaseConsent.findFirst({
      where: {
        userId,
        OR: [
          { courseId: course.id },
          { productKey: `course:${course.slug}` },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    if (consent) {
      await this.prisma.purchaseConsent.update({
        where: { id: consent.id },
        data: {
          firstContentOpenedAt: consent.firstContentOpenedAt ?? now,
          lastContentOpenedAt: now,
        },
      });
    }

    await this.prisma.contentSupplyEvent.create({
      data: {
        userId,
        courseId: course.id,
        consentId: consent?.id,
        productKey: `course:${course.slug}`,
        kind: 'open',
        path: input.path?.slice(0, 500) ?? `/cursos/${course.slug}`,
      },
    });

    return {
      ok: true as const,
      firstOpen: !consent?.firstContentOpenedAt,
      openedAt: now.toISOString(),
      criterion: CONTENT_SUPPLY_START_CRITERION,
    };
  }

  /**
   * Sincroniza una suscripción de Stripe con `subscriptions` y con el plan del usuario.
   * `fallbackUserId` se usa cuando todavía no hay fila previa ni cliente vinculado.
   */
  private async syncSubscription(
    subscription: Stripe.Subscription,
    fallbackUserId?: string,
  ) {
    const status = mapStripeSubscriptionStatus(subscription.status);
    if (!status) return;

    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer?.id;

    const existing = await this.prisma.subscription.findFirst({
      where: { provider: 'stripe', providerRef: subscription.id },
      select: { id: true, userId: true },
    });

    let userId = existing?.userId ?? fallbackUserId ?? null;
    if (!userId && subscription.metadata?.userId) {
      userId = subscription.metadata.userId;
    }
    if (!userId && customerId) {
      const byCustomer = await this.prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
        select: { id: true },
      });
      userId = byCustomer?.id ?? null;
    }
    if (!userId) {
      this.logger.warn(`Subscription ${subscription.id}: no matching user`);
      return;
    }

    const period = extractSubscriptionPeriod(subscription);
    const data = {
      status,
      planKey: PRO_PLAN_KEY,
      currentPeriodStart: period.start,
      currentPeriodEnd: period.end,
      cancelAt: period.cancelAt,
    };

    if (existing) {
      await this.prisma.subscription.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await this.prisma.subscription.create({
        data: {
          userId,
          provider: 'stripe',
          providerRef: subscription.id,
          ...data,
        },
      });
    }

    const keepPro = shouldKeepProPlan(status);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        plan: keepPro ? UserPlan.pro : UserPlan.free,
        ...(keepPro ? {} : { proCancellationRequestedAt: null }),
      },
    });
  }

  private async handleChargeRefunded(charge: Stripe.Charge) {
    if (!charge.refunded) return; // reembolso parcial: no se retira el acceso automáticamente
    const paymentIntentId =
      typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : (charge.payment_intent?.id ?? null);
    if (!paymentIntentId) return;

    const purchase = await this.prisma.purchase.findFirst({
      where: { provider: 'stripe', providerRef: paymentIntentId },
      select: { id: true, userId: true, courseId: true },
    });
    if (!purchase) return;

    await this.prisma.purchase.update({
      where: { id: purchase.id },
      data: { status: PurchaseStatus.refunded },
    });
    if (purchase.courseId) {
      await this.prisma.userCourseAccess.updateMany({
        where: {
          userId: purchase.userId,
          courseId: purchase.courseId,
          activatedByAdmin: false,
        },
        data: { isActive: false },
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Gestión de la suscripción por el propio usuario
  // ---------------------------------------------------------------------------

  async createPortalSession(userId: string): Promise<{ url: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      throw new BadRequestException(
        'No hay una suscripción de Stripe vinculada a tu cuenta.',
      );
    }

    const stripe = await this.getStripe();
    if (!stripe) {
      throw new ServiceUnavailableException(
        'La gestión de suscripción no está disponible en este momento.',
      );
    }

    const returnUrl =
      this.config.get<string>('STRIPE_PORTAL_RETURN_URL') ||
      this.config.get<string>('FRONTEND_URL') ||
      'http://localhost:3000/account';

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${returnUrl.replace(/\/$/, '')}/account`,
    });

    if (!session.url) {
      throw new ServiceUnavailableException(
        'No se pudo crear la sesión del portal de Stripe.',
      );
    }

    return { url: session.url };
  }

  /**
   * Cancelación en un clic. Si la suscripción vive en Stripe se programa para el final
   * del periodo ya pagado (el acceso se mantiene hasta entonces). Si no, se registra la
   * solicitud y la procesa el equipo (flujo heredado de altas manuales).
   */
  async requestCancellation(userId: string): Promise<{
    success: true;
    mode: 'stripe' | 'manual';
    accessUntil: string | null;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        fullName: true,
        phone: true,
        plan: true,
        stripeCustomerId: true,
        proCancellationRequestedAt: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado.');
    }

    if (user.plan !== 'pro') {
      throw new BadRequestException(
        'No tienes una suscripción VPO PRO activa.',
      );
    }

    if (user.proCancellationRequestedAt) {
      throw new BadRequestException(
        'Ya has solicitado la cancelación de tu suscripción.',
      );
    }

    const requestedAt = new Date();

    const scheduled = await this.scheduleStripeCancellation(
      userId,
      user.stripeCustomerId,
      true,
    );
    if (scheduled) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { proCancellationRequestedAt: requestedAt },
      });
      const accessUntilLabel = scheduled.periodEnd
        ? new Date(scheduled.periodEnd).toLocaleDateString('es-ES', {
            timeZone: 'Europe/Madrid',
          })
        : null;
      void this.notifications
        .notifyUserOfProCancellation({
          email: user.email,
          fullName: user.fullName,
          accessUntil: accessUntilLabel,
          stage: 'confirmed',
        })
        .catch(() => undefined);
      return {
        success: true,
        mode: 'stripe',
        accessUntil: scheduled.periodEnd,
      };
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { proCancellationRequestedAt: requestedAt },
    });

    void this.notifications
      .notifyUserOfProCancellation({
        email: user.email,
        fullName: user.fullName,
        accessUntil: null,
        stage: 'request',
      })
      .catch(() => undefined);

    try {
      const result = await this.notifications.notifyAdminsOfProCancellation({
        userId,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        requestedAt,
      });
      if (!result.sent) {
        this.logger.warn(
          `Cancellation stored for ${user.email} but admin email was not sent`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Cancellation stored for ${user.email} but admin email failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return { success: true, mode: 'manual', accessUntil: null };
  }

  async withdrawCancellation(userId: string): Promise<{ success: true }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        stripeCustomerId: true,
        proCancellationRequestedAt: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado.');
    }

    if (user.plan !== 'pro' || !user.proCancellationRequestedAt) {
      throw new BadRequestException(
        'No hay ninguna solicitud de cancelación pendiente.',
      );
    }

    await this.scheduleStripeCancellation(userId, user.stripeCustomerId, false);

    await this.prisma.user.update({
      where: { id: userId },
      data: { proCancellationRequestedAt: null },
    });

    return { success: true };
  }

  /**
   * Programa (o revierte) `cancel_at_period_end` en las suscripciones vivas del cliente.
   * Devuelve `null` si no hay Stripe/cliente/suscripción que gestionar.
   */
  private async scheduleStripeCancellation(
    userId: string,
    stripeCustomerId: string | null,
    cancel: boolean,
  ): Promise<{ periodEnd: string | null } | null> {
    if (!stripeCustomerId) return null;
    const stripe = await this.getStripe();
    if (!stripe) return null;

    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'all',
      limit: 20,
    });
    const live = subscriptions.data.filter((subscription) =>
      ['active', 'trialing', 'past_due'].includes(subscription.status),
    );
    if (live.length === 0) return null;

    let latestEnd: Date | null = null;
    for (const subscription of live) {
      const updated =
        subscription.cancel_at_period_end === cancel
          ? subscription
          : await stripe.subscriptions.update(subscription.id, {
              cancel_at_period_end: cancel,
            });
      const period = extractSubscriptionPeriod(updated);
      if (period.end && (!latestEnd || period.end > latestEnd)) {
        latestEnd = period.end;
      }
      await this.prisma.subscription.updateMany({
        where: { provider: 'stripe', providerRef: updated.id, userId },
        data: { cancelAt: cancel ? period.end : null },
      });
    }

    return { periodEnd: latestEnd?.toISOString() ?? null };
  }

  /** Cancelación procesada por un administrador (flujo heredado). */
  async cancelStripeSubscriptionsForUser(input: {
    userId: string;
    email: string;
    stripeCustomerId: string | null;
  }): Promise<{
    attempted: boolean;
    canceled: number;
    customerId: string | null;
    periodEnd: string | null;
    skippedReason?: string;
  }> {
    const stripe = await this.getStripe();
    if (!stripe) {
      return {
        attempted: false,
        canceled: 0,
        customerId: input.stripeCustomerId,
        periodEnd: null,
        skippedReason: 'missing_stripe_key',
      };
    }

    let customerId = input.stripeCustomerId?.trim() || null;
    if (!customerId) {
      const matches = await stripe.customers.list({
        email: input.email,
        limit: 3,
      });
      customerId = matches.data[0]?.id ?? null;
      if (customerId) {
        await this.prisma.user.update({
          where: { id: input.userId },
          data: { stripeCustomerId: customerId },
        });
      }
    }

    if (!customerId) {
      return {
        attempted: false,
        canceled: 0,
        customerId: null,
        periodEnd: null,
        skippedReason: 'stripe_customer_not_found',
      };
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 20,
    });

    const cancelable = subscriptions.data.filter((subscription) =>
      ['active', 'trialing', 'past_due', 'unpaid'].includes(
        subscription.status,
      ),
    );

    if (cancelable.length === 0) {
      return {
        attempted: true,
        canceled: 0,
        customerId,
        periodEnd: null,
        skippedReason: 'no_active_subscription',
      };
    }

    let latestPeriodEnd: string | null = null;
    for (const subscription of cancelable) {
      const updated = subscription.cancel_at_period_end
        ? subscription
        : await stripe.subscriptions.update(subscription.id, {
            cancel_at_period_end: true,
          });
      const periodEndUnix = getSubscriptionPeriodEnd(updated);
      const periodEnd = periodEndUnix
        ? new Date(periodEndUnix * 1000).toISOString()
        : null;
      if (periodEnd && (!latestPeriodEnd || periodEnd > latestPeriodEnd)) {
        latestPeriodEnd = periodEnd;
      }
    }

    await this.prisma.subscription.updateMany({
      where: {
        userId: input.userId,
        planKey: 'pro',
        status: {
          in: [SubscriptionStatus.active, SubscriptionStatus.trialing],
        },
      },
      data: {
        cancelAt: latestPeriodEnd ? new Date(latestPeriodEnd) : new Date(),
      },
    });

    return {
      attempted: true,
      canceled: cancelable.length,
      customerId,
      periodEnd: latestPeriodEnd,
    };
  }
}
