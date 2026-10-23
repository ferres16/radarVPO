import {
  BadRequestException,
  ForbiddenException,
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
  isOneOffPurchasableAccessType,
  mapStripeSubscriptionStatus,
  MIN_PUBLISHED_LESSONS_TO_SELL,
  parseCheckoutMetadata,
  PRO_PLAN_KEY,
  shouldKeepProPlan,
} from './stripe-fulfillment';

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

  private async getStripe(): Promise<Stripe | null> {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) return null;
    const StripeCtor = (await import('stripe')).default;
    return new StripeCtor(secretKey);
  }

  /**
   * El pago integrado solo se ofrece si Stripe puede confirmar los pagos por webhook.
   * Sin STRIPE_WEBHOOK_SECRET no se puede activar el acceso automáticamente, así que
   * la web no debe prometer "acceso inmediato".
   */
  isCheckoutConfigured(): boolean {
    return Boolean(
      this.config.get<string>('STRIPE_SECRET_KEY') &&
      this.config.get<string>('STRIPE_WEBHOOK_SECRET'),
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
        emailVerifiedAt: true,
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
    if (!user.emailVerifiedAt) {
      throw new ForbiddenException(
        'Debes verificar tu email antes de comprar. Revisa tu bandeja o solicita un nuevo enlace desde Mi cuenta.',
      );
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
      const metadata = {
        userId: user.id,
        product: isPack ? 'pro_pack_3m' : 'pro',
        ...(isPack ? { guideSlug } : {}),
        termsAcceptedAt: new Date().toISOString(),
        immediateAccessAccepted: 'true',
      };
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        client_reference_id: user.id,
        ...customerParams,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'eur',
              unit_amount: unitAmount,
              tax_behavior: commerce.stripeAutomaticTax
                ? 'inclusive'
                : undefined,
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
        allow_promotion_codes: commerce.allowPromotionCodes,
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
        success_url: `${siteUrl}/account?checkout=success&product=${isPack ? 'pro_pack_3m' : 'pro'}`,
        cancel_url: `${siteUrl}/checkout?product=${isPack ? 'pro_pack_3m' : 'pro'}&canceled=1`,
      });

      if (!session.url) {
        throw new ServiceUnavailableException(
          'No se pudo iniciar el pago. Inténtalo de nuevo.',
        );
      }
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

    const metadata = {
      userId: user.id,
      product: 'course',
      courseId: course.id,
      courseSlug: course.slug,
      termsAcceptedAt: new Date().toISOString(),
      immediateAccessAccepted: 'true',
    };
    const session = await stripe.checkout.sessions.create({
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
            tax_behavior: commerce.stripeAutomaticTax ? 'inclusive' : undefined,
            product_data: { name: course.title },
          },
        },
      ],
      metadata,
      payment_intent_data: { metadata, description: course.title },
      locale: 'es',
      allow_promotion_codes: commerce.allowPromotionCodes,
      ...(commerce.stripeAutomaticTax
        ? {
            automatic_tax: { enabled: true },
            billing_address_collection: 'required' as const,
            tax_id_collection: { enabled: true },
          }
        : {}),
      custom_text: {
        submit: {
          message: `Pago único de ${formatEuroAmount(unitAmount)}. Sin renovaciones. Acceso inmediato al curso tras confirmarse el pago.`,
        },
      },
      success_url: `${siteUrl}/cursos/${course.slug}?checkout=success`,
      cancel_url: `${siteUrl}/checkout?product=course&course=${encodeURIComponent(course.slug)}&canceled=1`,
    });

    if (!session.url) {
      throw new ServiceUnavailableException(
        'No se pudo iniciar el pago. Inténtalo de nuevo.',
      );
    }
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
      if (!course?.slug && !meta.courseSlug) {
        this.logger.warn(
          `purchase.course email skipped: missing course slug for ${session.id}`,
        );
      } else {
        void this.notifications
          .sendTemplatedEmail({
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
              access_until: '',
              billing_summary: buildBillingSummary({
                kind: 'course',
                amountCents: session.amount_total ?? 0,
              }),
            },
            requiredVars: ['product', 'url', 'price'],
            fallbackSubject: `Ya tienes acceso a ${courseTitle}`,
            fallbackHtml: `<p>Hola,</p><p>Tu compra de ${courseTitle} se ha confirmado.</p><p><a href="${courseUrl}">Acceder</a></p>`,
          })
          .catch(() => undefined);
      }
      await this.recordCheckoutConsent(user.id, session);
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
      void this.notifications
        .sendTemplatedEmail({
          templateKey: isPack ? 'purchase.pro_pack' : 'purchase.pro',
          toEmail: user.email,
          toName: displayName,
          vars: {
            name: displayName,
            email: user.email,
            product: guideTitle,
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
          },
          requiredVars: isPack
            ? ['product', 'url', 'access_until', 'billing_summary']
            : ['url', 'billing_summary'],
          fallbackSubject: isPack
            ? 'Tu pack PRO de tres meses está activo'
            : 'Tu Radar VPO PRO ya está activo',
          fallbackHtml: `<p>Hola,</p><p>Tu suscripción PRO ya está activa.</p><p><a href="${siteUrl}/account">Entrar en mi cuenta</a></p>`,
        })
        .catch(() => undefined);
      await this.recordCheckoutConsent(user.id, session);
    }
  }

  private async recordCheckoutConsent(
    userId: string,
    session: Stripe.Checkout.Session,
  ) {
    const termsAcceptedAt = session.metadata?.termsAcceptedAt;
    if (!termsAcceptedAt) return;
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'billing.checkout.terms_accepted',
        entity: 'CheckoutSession',
        entityId: session.id,
        metadata: {
          product: session.metadata?.product ?? null,
          termsAcceptedAt,
          immediateAccessAccepted:
            session.metadata?.immediateAccessAccepted ?? null,
        },
      },
    });
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
