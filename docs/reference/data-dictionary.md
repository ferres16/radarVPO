# Diccionario de datos (PostgreSQL vía Prisma)

> Generado por `scripts/generate-reference-docs.mjs`. No editar a mano: ejecuta `npm run docs:reference`.

Fuente: `backend/prisma/schema.prisma`. **42** modelos y **28** enums. Los nombres de tabla/columna reales son los de `@@map`/`@map` (snake_case).

Columna *Datos*: **P** = dato personal (RGPD), **S** = secreto/credencial (solo hash; nunca se devuelve por la API).

## Identidad y sesiones

### User (`users`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| email | String | no | @unique | P |  |
| fullName | String | no | @map("full_name") | P |  |
| phone | String | no | @map("phone") | P |  |
| passwordHash | String | no | @map("password_hash") | S P |  |
| role | UserRole | no | @default(user) |  |  |
| plan | UserPlan | no | @default(free) |  |  |
| emailVerifiedAt | DateTime | sí | @map("email_verified_at") | P |  |
| marketingOptInAt | DateTime | sí | @map("marketing_opt_in_at") |  |  |
| marketingOptInVersion | String | sí | @map("marketing_opt_in_version") |  |  |
| marketingOptOutAt | DateTime | sí | @map("marketing_opt_out_at") |  |  |
| smsAlertsEnabled | Boolean | no | @default(false) @map("sms_alerts_enabled") |  |  |
| alertMunicipalityIds | Json | sí | @map("alert_municipality_ids") |  |  |
| alertPromotionTypes | Json | sí | @map("alert_promotion_types") |  |  |
| stripeCustomerId | String | sí | @map("stripe_customer_id") |  |  |
| proCancellationRequestedAt | DateTime | sí | @map("pro_cancellation_requested_at") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| updatedAt | DateTime | no | @updatedAt @map("updated_at") |  |  |
| lastLoginAt | DateTime | sí | @map("last_login_at") |  |  |
| sessions | → Session[] | no |  |  |  |
| savedSearches | → SavedSearch[] | no |  |  |  |
| alerts | → UserAlert[] | no |  |  |  |
| reminders | → Reminder[] | no |  |  |  |
| auditLogs | → AuditLog[] | no |  |  |  |
| favorites | → PromotionFavorite[] | no |  |  |  |
| entitlements | → UserEntitlement[] | no |  |  |  |
| purchases | → Purchase[] | no |  |  |  |
| subscriptions | → Subscription[] | no |  |  |  |
| courseProgresses | → CourseProgress[] | no |  |  |  |
| lessonProgresses | → LessonProgress[] | no |  |  |  |
| courseAccesses | → UserCourseAccess[] | no |  |  |  |
| serviceAccesses | → UserServiceAccess[] | no |  |  |  |
| uploadedFiles | → FileAsset[] | no |  |  |  |
| passwordResetTokens | → PasswordResetToken[] | no |  |  |  |
| emailVerificationTokens | → EmailVerificationToken[] | no |  |  |  |
| waitlistLeads | → WaitlistLead[] | no |  |  |  |
| purchaseConsents | → PurchaseConsent[] | no |  |  |  |
| contentSupplyEvents | → ContentSupplyEvent[] | no |  |  |  |

Índices y restricciones:

- `@@index([emailVerifiedAt])`
- `@@index([marketingOptInAt])`

### PasswordResetToken (`password_reset_tokens`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| userId | String | no | @map("user_id") |  |  |
| tokenHash | String | no | @unique @map("token_hash") | S |  |
| expiresAt | DateTime | no | @map("expires_at") |  |  |
| usedAt | DateTime | sí | @map("used_at") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| user | → User | no | @relation(fields: [userId], references: [id], onDelete: Cascade) |  |  |

Índices y restricciones:

- `@@index([userId, createdAt])`

### EmailVerificationToken (`email_verification_tokens`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| userId | String | no | @map("user_id") |  |  |
| tokenHash | String | no | @unique @map("token_hash") | S |  |
| expiresAt | DateTime | no | @map("expires_at") |  |  |
| usedAt | DateTime | sí | @map("used_at") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| user | → User | no | @relation(fields: [userId], references: [id], onDelete: Cascade) |  |  |

Índices y restricciones:

- `@@index([userId, createdAt])`

### Session (`sessions`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id |  |  |
| userId | String | no | @map("user_id") |  |  |
| refreshTokenHash | String | no | @map("refresh_token_hash") | S |  |
| expiresAt | DateTime | no | @map("expires_at") |  |  |
| revokedAt | DateTime | sí | @map("revoked_at") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| user | → User | no | @relation(fields: [userId], references: [id], onDelete: Cascade) |  |  |

Índices y restricciones:

- `@@index([userId])`
- `@@index([revokedAt, expiresAt])`

### AuditLog (`audit_logs`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| userId | String | sí | @map("user_id") |  |  |
| action | String | no |  |  |  |
| entity | String | no |  |  |  |
| entityId | String | sí | @map("entity_id") |  |  |
| metadata | Json | sí |  |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| user | → User | sí | @relation(fields: [userId], references: [id], onDelete: SetNull) |  |  |

Índices y restricciones:

- `@@index([entity, entityId])`
- `@@index([userId, createdAt])`
- `@@index([action, createdAt])`

## Comercio y pagos

### StripeProcessedEvent (`stripe_processed_events`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| eventId | String | no | @id @map("event_id") |  |  |
| type | String | no |  |  |  |
| status | String | no | @default("processing") |  |  |
| errorMessage | String | sí | @map("error_message") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| processedAt | DateTime | sí | @map("processed_at") |  |  |

Índices y restricciones:

- `@@index([status, createdAt])`

### CommercePromoRule (`commerce_promo_rules`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| key | String | no | @unique |  |  |
| name | String | no |  | P |  |
| ruleType | String | no | @map("rule_type") |  |  |
| enabled | Boolean | no | @default(true) |  |  |
| config | Json | sí |  |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| updatedAt | DateTime | no | @updatedAt @map("updated_at") |  |  |

### Service (`services`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| key | String | no | @unique |  |  |
| name | String | no |  | P |  |
| description | String | sí |  |  |  |
| price | Decimal | sí | @db.Decimal(12, 2) |  |  |
| salePrice | Decimal | sí | @map("sale_price") @db.Decimal(12, 2) |  |  |
| currency | String | sí | @db.VarChar(8) |  |  |
| status | ServiceStatus | no | @default(active) |  |  |
| serviceType | ServiceType | no | @default(manual) @map("service_type") |  |  |
| stripePaymentLink | String | sí | @map("stripe_payment_link") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| updatedAt | DateTime | no | @updatedAt @map("updated_at") |  |  |
| accesses | → UserServiceAccess[] | no |  |  |  |

Índices y restricciones:

- `@@index([status])`

### UserServiceAccess (`user_service_accesses`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| userId | String | no | @map("user_id") |  |  |
| serviceId | String | no | @map("service_id") |  |  |
| isActive | Boolean | no | @default(true) @map("is_active") |  |  |
| activatedAt | DateTime | no | @default(now()) @map("activated_at") |  |  |
| activatedBy | String | sí | @map("activated_by") |  |  |
| activatedByAdmin | Boolean | no | @default(true) @map("activated_by_admin") |  |  |
| notes | String | sí |  |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| updatedAt | DateTime | no | @updatedAt @map("updated_at") |  |  |
| user | → User | no | @relation(fields: [userId], references: [id], onDelete: Cascade) |  |  |
| service | → Service | no | @relation(fields: [serviceId], references: [id], onDelete: Cascade) |  |  |

Índices y restricciones:

- `@@unique([userId, serviceId])`
- `@@index([userId, isActive])`
- `@@index([serviceId])`

### UserEntitlement (`user_entitlements`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| userId | String | no | @map("user_id") |  |  |
| key | String | no |  |  |  |
| source | String | no |  |  |  |
| sourceId | String | sí | @map("source_id") |  |  |
| startsAt | DateTime | sí | @map("starts_at") |  |  |
| endsAt | DateTime | sí | @map("ends_at") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| user | → User | no | @relation(fields: [userId], references: [id], onDelete: Cascade) |  |  |

Índices y restricciones:

- `@@index([userId, key])`

### Purchase (`purchases`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| userId | String | no | @map("user_id") |  |  |
| courseId | String | sí | @map("course_id") |  |  |
| provider | String | no |  |  |  |
| providerRef | String | sí | @map("provider_ref") |  |  |
| productKey | String | no | @map("product_key") |  |  |
| status | PurchaseStatus | no | @default(pending) |  |  |
| amount | Decimal | sí | @db.Decimal(12, 2) |  |  |
| currency | String | sí | @db.VarChar(8) |  |  |
| purchasedAt | DateTime | sí | @map("purchased_at") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| user | → User | no | @relation(fields: [userId], references: [id], onDelete: Cascade) |  |  |
| course | → Course | sí | @relation(fields: [courseId], references: [id], onDelete: SetNull) |  |  |
| consent | → PurchaseConsent | sí |  |  |  |

Índices y restricciones:

- `@@unique([provider, providerRef])`
- `@@index([userId, status])`
- `@@index([courseId, status])`
- `@@index([status, purchasedAt])`

### PurchaseConsent (`purchase_consents`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| userId | String | no | @map("user_id") |  |  |
| purchaseId | String | sí | @unique @map("purchase_id") |  |  |
| stripeSessionId | String | no | @unique @map("stripe_session_id") |  |  |
| productKey | String | no | @map("product_key") |  |  |
| courseId | String | sí | @map("course_id") |  |  |
| termsVersion | String | no | @map("terms_version") |  |  |
| termsTextSnapshot | String | no | @map("terms_text_snapshot") @db.Text |  |  |
| termsAcceptedAt | DateTime | no | @map("terms_accepted_at") |  |  |
| immediateConsentVersion | String | sí | @map("immediate_consent_version") |  |  |
| immediateTextSnapshot | String | sí | @map("immediate_text_snapshot") @db.Text |  |  |
| immediateAcceptedAt | DateTime | sí | @map("immediate_accepted_at") |  |  |
| confirmationEmailStatus | String | no | @default("pending") @map("confirmation_email_status") | P |  |
| confirmationEmailSentAt | DateTime | sí | @map("confirmation_email_sent_at") | P |  |
| confirmationEmailError | String | sí | @map("confirmation_email_error") @db.Text | P |  |
| firstContentOpenedAt | DateTime | sí | @map("first_content_opened_at") |  |  |
| lastContentOpenedAt | DateTime | sí | @map("last_content_opened_at") |  |  |
| accessGrantedAt | DateTime | sí | @map("access_granted_at") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| updatedAt | DateTime | no | @updatedAt @map("updated_at") |  |  |
| user | → User | no | @relation(fields: [userId], references: [id], onDelete: Cascade) |  |  |
| purchase | → Purchase | sí | @relation(fields: [purchaseId], references: [id], onDelete: SetNull) |  |  |

Índices y restricciones:

- `@@index([userId, createdAt])`
- `@@index([productKey, createdAt])`
- `@@index([confirmationEmailStatus])`
- `@@index([courseId])`

### Subscription (`subscriptions`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| userId | String | no | @map("user_id") |  |  |
| provider | String | no |  |  |  |
| providerRef | String | sí | @map("provider_ref") |  |  |
| status | SubscriptionStatus | no | @default(trialing) |  |  |
| planKey | String | no | @map("plan_key") |  |  |
| currentPeriodStart | DateTime | sí | @map("current_period_start") |  |  |
| currentPeriodEnd | DateTime | sí | @map("current_period_end") |  |  |
| cancelAt | DateTime | sí | @map("cancel_at") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| user | → User | no | @relation(fields: [userId], references: [id], onDelete: Cascade) |  |  |

Índices y restricciones:

- `@@unique([provider, providerRef])`
- `@@index([userId, status])`
- `@@index([status, currentPeriodEnd])`

## Cursos y guía

### Course (`courses`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| title | String | no |  |  |  |
| slug | String | no | @unique |  |  |
| shortDescription | String | sí | @map("short_description") |  |  |
| longDescription | String | sí | @map("long_description") |  |  |
| coverImage | String | sí | @map("cover_image") |  |  |
| pricingType | CoursePricingType | no | @default(free) @map("pricing_type") |  |  |
| price | Decimal | sí | @db.Decimal(12, 2) |  |  |
| salePrice | Decimal | sí | @map("sale_price") @db.Decimal(12, 2) |  |  |
| currency | String | sí | @db.VarChar(8) |  |  |
| stripePaymentLink | String | sí | @map("stripe_payment_link") |  |  |
| status | CourseStatus | no | @default(draft) |  |  |
| accessType | CourseAccessType | no | @default(free) @map("access_type") |  |  |
| format | CourseFormat | no | @default(standard) |  |  |
| guidePdfAssetId | String | sí | @map("guide_pdf_asset_id") |  |  |
| order | Int | no | @default(0) |  |  |
| seoTitle | String | sí | @map("seo_title") |  |  |
| seoDescription | String | sí | @map("seo_description") |  |  |
| seoMetadata | Json | sí | @map("seo_metadata") |  |  |
| publishedAt | DateTime | sí | @map("published_at") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| updatedAt | DateTime | no | @updatedAt @map("updated_at") |  |  |
| modules | → CourseModule[] | no |  |  |  |
| lessons | → CourseLesson[] | no |  |  |  |
| resources | → CourseResource[] | no |  |  |  |
| assets | → CourseAsset[] | no |  |  |  |
| accessRules | → CourseAccessRule[] | no |  |  |  |
| progresses | → CourseProgress[] | no |  |  |  |
| lessonProgresses | → LessonProgress[] | no |  |  |  |
| purchases | → Purchase[] | no |  |  |  |
| userAccesses | → UserCourseAccess[] | no |  |  |  |
| guidePdfAsset | → FileAsset | sí | @relation("CourseGuidePdf", fields: [guidePdfAssetId], references: [id], onDelete: SetNull) |  |  |

Índices y restricciones:

- `@@index([status, accessType])`
- `@@index([status, order, createdAt])`
- `@@index([format])`

### CourseModule (`course_modules`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| courseId | String | no | @map("course_id") |  |  |
| title | String | no |  |  |  |
| description | String | sí |  |  |  |
| order | Int | no | @default(0) |  |  |
| visibility | CourseModuleVisibility | no | @default(visible) |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| updatedAt | DateTime | no | @updatedAt @map("updated_at") |  |  |
| course | → Course | no | @relation(fields: [courseId], references: [id], onDelete: Cascade) |  |  |
| lessons | → CourseLesson[] | no |  |  |  |
| resources | → CourseResource[] | no |  |  |  |
| assets | → CourseAsset[] | no |  |  |  |
| lessonProgresses | → LessonProgress[] | no |  |  |  |

Índices y restricciones:

- `@@index([courseId, order])`

### CourseLesson (`course_lessons`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| courseId | String | no | @map("course_id") |  |  |
| moduleId | String | no | @map("module_id") |  |  |
| title | String | no |  |  |  |
| slug | String | no |  |  |  |
| summary | String | sí |  |  |  |
| contentJson | Json | sí | @map("content_json") |  |  |
| order | Int | no | @default(0) |  |  |
| durationMinutes | Int | sí | @map("duration_minutes") |  |  |
| status | LessonStatus | no | @default(draft) |  |  |
| type | LessonType | no | @default(text) |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| updatedAt | DateTime | no | @updatedAt @map("updated_at") |  |  |
| course | → Course | no | @relation(fields: [courseId], references: [id], onDelete: Cascade) |  |  |
| module | → CourseModule | no | @relation(fields: [moduleId], references: [id], onDelete: Cascade) |  |  |
| resources | → CourseResource[] | no |  |  |  |
| blocks | → CourseContentBlock[] | no |  |  |  |
| assets | → CourseAsset[] | no |  |  |  |
| progresses | → LessonProgress[] | no |  |  |  |
| lastProgresses | → CourseProgress[] | no | @relation("LastLessonProgress") |  |  |

Índices y restricciones:

- `@@unique([courseId, slug])`
- `@@index([moduleId, order])`

### CourseContentBlock (`course_content_blocks`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| lessonId | String | no | @map("lesson_id") |  |  |
| type | CourseContentBlockType | no |  |  |  |
| content | Json | no |  |  |  |
| order | Int | no | @default(0) |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| updatedAt | DateTime | no | @updatedAt @map("updated_at") |  |  |
| lesson | → CourseLesson | no | @relation(fields: [lessonId], references: [id], onDelete: Cascade) |  |  |
| assets | → CourseAsset[] | no |  |  |  |

Índices y restricciones:

- `@@index([lessonId, order])`

### CourseAsset (`course_assets`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| courseId | String | no | @map("course_id") |  |  |
| moduleId | String | sí | @map("module_id") |  |  |
| lessonId | String | sí | @map("lesson_id") |  |  |
| blockId | String | sí | @map("block_id") |  |  |
| fileAssetId | String | sí | @map("file_asset_id") |  |  |
| kind | CourseAssetKind | no |  |  |  |
| originalName | String | sí | @map("original_name") | P |  |
| mimeType | String | no | @map("mime_type") |  |  |
| size | Int | no | @default(0) |  |  |
| s3Key | String | no | @map("s3_key") |  |  |
| url | String | sí |  |  |  |
| isPublic | Boolean | no | @default(false) @map("is_public") |  |  |
| altText | String | sí | @map("alt_text") |  |  |
| caption | String | sí |  |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| course | → Course | no | @relation(fields: [courseId], references: [id], onDelete: Cascade) |  |  |
| module | → CourseModule | sí | @relation(fields: [moduleId], references: [id], onDelete: Cascade) |  |  |
| lesson | → CourseLesson | sí | @relation(fields: [lessonId], references: [id], onDelete: Cascade) |  |  |
| block | → CourseContentBlock | sí | @relation(fields: [blockId], references: [id], onDelete: Cascade) |  |  |
| fileAsset | → FileAsset | sí | @relation(fields: [fileAssetId], references: [id], onDelete: SetNull) |  |  |

Índices y restricciones:

- `@@index([courseId])`
- `@@index([lessonId])`
- `@@index([blockId])`
- `@@index([fileAssetId])`

### CourseResource (`course_resources`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| courseId | String | no | @map("course_id") |  |  |
| moduleId | String | sí | @map("module_id") |  |  |
| lessonId | String | sí | @map("lesson_id") |  |  |
| fileAssetId | String | sí | @map("file_asset_id") |  |  |
| kind | CourseResourceKind | no |  |  |  |
| fileType | String | no | @map("file_type") |  |  |
| originalName | String | sí | @map("original_name") | P |  |
| storagePath | String | no | @map("storage_path") |  |  |
| publicUrl | String | no | @map("public_url") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| course | → Course | no | @relation(fields: [courseId], references: [id], onDelete: Cascade) |  |  |
| module | → CourseModule | sí | @relation(fields: [moduleId], references: [id], onDelete: Cascade) |  |  |
| lesson | → CourseLesson | sí | @relation(fields: [lessonId], references: [id], onDelete: Cascade) |  |  |
| fileAsset | → FileAsset | sí | @relation(fields: [fileAssetId], references: [id], onDelete: SetNull) |  |  |

Índices y restricciones:

- `@@index([courseId])`
- `@@index([lessonId])`
- `@@index([fileAssetId])`

### CourseAccessRule (`course_access_rules`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| courseId | String | no | @map("course_id") |  |  |
| ruleType | CourseAccessRuleType | no | @map("rule_type") |  |  |
| configJson | Json | no | @map("config_json") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| course | → Course | no | @relation(fields: [courseId], references: [id], onDelete: Cascade) |  |  |

Índices y restricciones:

- `@@index([courseId, ruleType])`

### UserCourseAccess (`user_course_accesses`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| userId | String | no | @map("user_id") |  |  |
| courseId | String | no | @map("course_id") |  |  |
| isActive | Boolean | no | @default(true) @map("is_active") |  |  |
| activatedAt | DateTime | no | @default(now()) @map("activated_at") |  |  |
| activatedBy | String | sí | @map("activated_by") |  |  |
| activatedByAdmin | Boolean | no | @default(true) @map("activated_by_admin") |  |  |
| notes | String | sí |  |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| updatedAt | DateTime | no | @updatedAt @map("updated_at") |  |  |
| user | → User | no | @relation(fields: [userId], references: [id], onDelete: Cascade) |  |  |
| course | → Course | no | @relation(fields: [courseId], references: [id], onDelete: Cascade) |  |  |

Índices y restricciones:

- `@@unique([userId, courseId])`
- `@@index([userId, isActive])`
- `@@index([courseId])`

### ContentSupplyEvent (`content_supply_events`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| userId | String | no | @map("user_id") |  |  |
| courseId | String | sí | @map("course_id") |  |  |
| consentId | String | sí | @map("consent_id") |  |  |
| productKey | String | no | @map("product_key") |  |  |
| kind | String | no | @default("open") |  |  |
| path | String | sí |  |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| user | → User | no | @relation(fields: [userId], references: [id], onDelete: Cascade) |  |  |

Índices y restricciones:

- `@@index([userId, courseId, createdAt])`
- `@@index([consentId, createdAt])`
- `@@index([courseId])`

### CourseProgress (`course_progress`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| userId | String | no | @map("user_id") |  |  |
| courseId | String | no | @map("course_id") |  |  |
| progressPercent | Int | no | @default(0) @map("progress_percent") |  |  |
| completedLessons | Int | no | @default(0) @map("completed_lessons") |  |  |
| totalLessons | Int | no | @default(0) @map("total_lessons") |  |  |
| lastLessonId | String | sí | @map("last_lesson_id") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| updatedAt | DateTime | no | @updatedAt @map("updated_at") |  |  |
| user | → User | no | @relation(fields: [userId], references: [id], onDelete: Cascade) |  |  |
| course | → Course | no | @relation(fields: [courseId], references: [id], onDelete: Cascade) |  |  |
| lastLesson | → CourseLesson | sí | @relation("LastLessonProgress", fields: [lastLessonId], references: [id], onDelete: SetNull) |  |  |

Índices y restricciones:

- `@@unique([userId, courseId])`
- `@@index([courseId])`
- `@@index([lastLessonId])`

### LessonProgress (`lesson_progress`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| userId | String | no | @map("user_id") |  |  |
| courseId | String | no | @map("course_id") |  |  |
| moduleId | String | no | @map("module_id") |  |  |
| lessonId | String | no | @map("lesson_id") |  |  |
| status | LessonProgressStatus | no | @default(not_started) |  |  |
| completedAt | DateTime | sí | @map("completed_at") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| updatedAt | DateTime | no | @updatedAt @map("updated_at") |  |  |
| user | → User | no | @relation(fields: [userId], references: [id], onDelete: Cascade) |  |  |
| course | → Course | no | @relation(fields: [courseId], references: [id], onDelete: Cascade) |  |  |
| module | → CourseModule | no | @relation(fields: [moduleId], references: [id], onDelete: Cascade) |  |  |
| lesson | → CourseLesson | no | @relation(fields: [lessonId], references: [id], onDelete: Cascade) |  |  |

Índices y restricciones:

- `@@unique([userId, lessonId])`
- `@@index([courseId, userId])`
- `@@index([lessonId])`
- `@@index([moduleId])`

## Promociones y alertas

### Promotion (`promotions`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| sourceId | String | no | @map("source_id") |  |  |
| title | String | no |  |  |  |
| location | String | sí |  |  |  |
| municipality | String | sí |  |  |  |
| municipalityRaw | String | sí | @map("municipality_raw") |  |  |
| municipalityId | String | sí | @map("municipality_id") |  |  |
| municipalityNeedsReview | Boolean | no | @default(false) @map("municipality_needs_review") |  |  |
| province | String | sí |  |  |  |
| autonomousCommunity | String | sí | @map("autonomous_community") |  |  |
| promotionType | PromotionType | no | @default(desconocido) @map("promotion_type") |  |  |
| targetScope | TargetScope | no | @default(otro) @map("target_scope") | P |  |
| tenureType | String | sí | @map("tenure_type") |  |  |
| status | PromotionStatus | no | @default(pending_review) |  |  |
| publishedAt | DateTime | sí | @map("published_at") |  |  |
| deadlineDate | DateTime | sí | @map("deadline_date") |  |  |
| estimatedPublicationDate | DateTime | sí | @map("estimated_publication_date") |  |  |
| sourceUrl | String | no | @map("source_url") |  |  |
| rawText | String | sí | @map("raw_text") |  |  |
| alertDetectedAt | DateTime | no | @default(now()) @map("alert_detected_at") |  |  |
| statusMessage | String | no | @default("Estamos analizando esta promocion y actualizando la informacion") @map("status_message") |  |  |
| manuallyRemovedAt | DateTime | sí | @map("manually_removed_at") |  |  |
| promoter | String | sí |  |  |  |
| totalHomes | Int | sí | @map("total_homes") |  |  |
| generalInfo | Json | sí | @map("general_info") |  |  |
| importantDates | Json | sí | @map("important_dates") |  |  |
| requirements | Json | sí | @map("requirements") |  |  |
| economicInfo | Json | sí | @map("economic_info") |  |  |
| feesAndReservations | Json | sí | @map("fees_and_reservations") |  |  |
| contactInfo | Json | sí | @map("contact_info") |  |  |
| publicDescription | String | sí | @map("public_description") |  |  |
| availableUnitsText | String | sí | @map("available_units_text") |  |  |
| isProOnly | Boolean | no | @default(false) @map("is_pro_only") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| updatedAt | DateTime | no | @updatedAt @map("updated_at") |  |  |
| source | → Source | no | @relation(fields: [sourceId], references: [id], onDelete: Cascade) |  |  |
| documents | → PromotionDocument[] | no |  |  |  |
| units | → PromotionUnit[] | no |  |  |  |
| favorites | → PromotionFavorite[] | no |  |  |  |

Índices y restricciones:

- `@@index([municipality, province, status])`
- `@@index([status, publishedAt], map: "idx_promotions_status_published_at")`
- `@@index([status, estimatedPublicationDate], map: "idx_promotions_status_estimated_publication_date")`
- `@@index([province, municipality, publishedAt])`
- `@@index([manuallyRemovedAt])`
- `@@index([sourceUrl])`

### PromotionDocument (`promotion_documents`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| promotionId | String | no | @map("promotion_id") |  |  |
| fileAssetId | String | sí | @map("file_asset_id") |  |  |
| documentKind | PromotionDocumentKind | no | @map("document_kind") |  |  |
| title | String | sí |  |  |  |
| description | String | sí |  |  |  |
| altText | String | sí | @map("alt_text") |  |  |
| sortOrder | Int | no | @default(0) @map("sort_order") |  |  |
| isFeatured | Boolean | no | @default(false) @map("is_featured") |  |  |
| isPublic | Boolean | no | @default(true) @map("is_public") |  |  |
| section | String | sí |  |  |  |
| reviewStatus | String | no | @default("published") @map("review_status") |  |  |
| fileType | String | no | @map("file_type") |  |  |
| originalName | String | sí | @map("original_name") | P |  |
| storagePath | String | no | @map("storage_path") |  |  |
| publicUrl | String | no | @map("public_url") |  |  |
| uploadedBy | String | sí | @map("uploaded_by") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| promotion | → Promotion | no | @relation(fields: [promotionId], references: [id], onDelete: Cascade) |  |  |
| fileAsset | → FileAsset | sí | @relation(fields: [fileAssetId], references: [id], onDelete: SetNull) |  |  |

Índices y restricciones:

- `@@index([promotionId, documentKind])`
- `@@index([promotionId, sortOrder])`
- `@@index([fileAssetId])`

### PromotionUnit (`promotion_units`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| promotionId | String | no | @map("promotion_id") |  |  |
| rowOrder | Int | no | @default(0) @map("row_order") |  |  |
| unitLabel | String | sí | @map("unit_label") |  |  |
| building | String | sí |  |  |  |
| stair | String | sí |  |  |  |
| floor | String | sí |  |  |  |
| door | String | sí |  |  |  |
| bedrooms | Int | sí |  |  |  |
| bathrooms | Int | sí |  |  |  |
| usefulAreaM2 | Decimal | sí | @map("useful_area_m2") @db.Decimal(8, 2) |  |  |
| builtAreaM2 | Decimal | sí | @map("built_area_m2") @db.Decimal(8, 2) |  |  |
| priceSale | Decimal | sí | @map("price_sale") @db.Decimal(12, 2) |  |  |
| monthlyRent | Decimal | sí | @map("monthly_rent") @db.Decimal(12, 2) |  |  |
| reservation | Decimal | sí | @db.Decimal(12, 2) |  |  |
| notes | String | sí |  |  |  |
| extraData | Json | sí | @map("extra_data") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| updatedAt | DateTime | no | @updatedAt @map("updated_at") |  |  |
| promotion | → Promotion | no | @relation(fields: [promotionId], references: [id], onDelete: Cascade) |  |  |

Índices y restricciones:

- `@@index([promotionId, rowOrder])`

### Reminder (`reminders`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| userId | String | no | @map("user_id") |  |  |
| kind | String | no |  |  |  |
| payload | Json | no |  |  |  |
| remindAt | DateTime | no | @map("remind_at") |  |  |
| sentAt | DateTime | sí | @map("sent_at") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| user | → User | no | @relation(fields: [userId], references: [id], onDelete: Cascade) |  |  |

Índices y restricciones:

- `@@index([userId])`
- `@@index([sentAt, remindAt])`

### SavedSearch (`saved_searches`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| userId | String | no | @map("user_id") |  |  |
| name | String | no |  | P |  |
| filtersJson | Json | no | @map("filters_json") |  |  |
| notificationsOn | Boolean | no | @default(true) @map("notifications_on") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| updatedAt | DateTime | no | @updatedAt @map("updated_at") |  |  |
| user | → User | no | @relation(fields: [userId], references: [id], onDelete: Cascade) |  |  |

Índices y restricciones:

- `@@index([userId])`

### UserAlert (`user_alerts`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| userId | String | no | @map("user_id") |  |  |
| type | String | no |  |  |  |
| enabled | Boolean | no | @default(true) |  |  |
| channel | String | no |  |  |  |
| configJson | Json | sí | @map("config_json") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| updatedAt | DateTime | no | @updatedAt @map("updated_at") |  |  |
| user | → User | no | @relation(fields: [userId], references: [id], onDelete: Cascade) |  |  |

Índices y restricciones:

- `@@index([userId])`

### PromotionFavorite (`promotion_favorites`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| userId | String | no | @map("user_id") |  |  |
| promotionId | String | no | @map("promotion_id") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| updatedAt | DateTime | no | @default(now()) @updatedAt @map("updated_at") |  |  |
| stage | FavoriteStage | no | @default(interested) |  | Seguimiento personal del usuario (Mi espacio). No es un expediente gestionado por Radar VPO. |
| notes | String | sí |  |  |  |
| checklistDone | String[] | no | @default([]) @map("checklist_done") |  |  |
| user | → User | no | @relation(fields: [userId], references: [id], onDelete: Cascade) |  |  |
| promotion | → Promotion | no | @relation(fields: [promotionId], references: [id], onDelete: Cascade) |  |  |

Índices y restricciones:

- `@@unique([userId, promotionId])`
- `@@index([promotionId])`

## Notificaciones

### MessageTemplate (`message_templates`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| key | String | no | @unique |  |  |
| label | String | no |  |  |  |
| description | String | sí |  |  |  |
| channel | String | no | @default("both") |  |  |
| emailSubject | String | sí | @map("email_subject") | P |  |
| emailBody | String | sí | @map("email_body") @db.Text | P |  |
| smsBody | String | sí | @map("sms_body") |  |  |
| active | Boolean | no | @default(true) |  |  |
| isCustomized | Boolean | no | @default(false) @map("is_customized") |  |  |
| seedRevision | Int | no | @default(1) @map("seed_revision") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| updatedAt | DateTime | no | @updatedAt @map("updated_at") |  |  |

### PublishedPost (`published_posts`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| sourceKind | String | no | @map("source_kind") |  |  |
| sourceId | String | no | @map("source_id") |  |  |
| audience | AudienceType | no |  |  |  |
| channel | String | no |  |  |  |
| payloadJson | Json | no | @map("payload_json") |  |  |
| status | String | no |  |  |  |
| sentAt | DateTime | sí | @map("sent_at") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |

Índices y restricciones:

- `@@index([sourceId, sourceKind, audience, channel, status])`

### DeliveryFailure (`delivery_failures`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| channel | String | no |  |  |  |
| target | String | no |  | P |  |
| sourceRef | String | sí | @map("source_ref") |  |  |
| errorCode | String | no | @map("error_code") |  |  |
| errorDetail | Json | sí | @map("error_detail") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |

Índices y restricciones:

- `@@index([createdAt])`
- `@@index([sourceRef])`

### DeliveryLog (`delivery_logs`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| channel | String | no |  |  |  |
| status | String | no |  |  |  |
| target | String | no |  | P |  |
| sourceRef | String | sí | @map("source_ref") |  |  |
| errorCode | String | sí | @map("error_code") |  |  |
| errorDetail | Json | sí | @map("error_detail") |  |  |
| subject | String | sí |  |  | Asunto del email (null en SMS). |
| content | String | sí |  |  | Texto exacto del SMS o HTML exacto del email enviado a Brevo. |
| context | Json | sí |  |  | Por qué se envió: trigger, tipo de aviso, promoción, etc. |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |

Índices y restricciones:

- `@@index([channel, createdAt])`
- `@@index([status, createdAt])`
- `@@index([sourceRef])`
- `@@index([target])`

## Contenido, ficheros y operación

### Source (`sources`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| name | String | no |  | P |  |
| sourceType | String | no | @map("source_type") |  |  |
| baseUrl | String | no | @map("base_url") |  |  |
| active | Boolean | no | @default(true) |  |  |
| scrapeConfig | Json | sí | @map("scrape_config") |  |  |
| lastSuccessfulRunAt | DateTime | sí | @map("last_successful_run_at") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| updatedAt | DateTime | no | @updatedAt @map("updated_at") |  |  |
| promotions | → Promotion[] | no |  |  |  |

### FileAsset (`file_assets`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| entityType | FileEntityType | no | @map("entity_type") |  |  |
| entityId | String | no | @map("entity_id") |  |  |
| fileName | String | no | @map("file_name") | P |  |
| originalName | String | no | @map("original_name") | P |  |
| mimeType | String | no | @map("mime_type") |  |  |
| size | Int | no |  |  |  |
| s3Key | String | no | @map("s3_key") |  |  |
| s3Bucket | String | no | @map("s3_bucket") |  |  |
| url | String | sí |  |  |  |
| isPublic | Boolean | no | @default(true) @map("is_public") |  |  |
| uploadedByUserId | String | sí | @map("uploaded_by_user_id") |  |  |
| status | FileAssetStatus | no | @default(active) |  |  |
| deleteError | String | sí | @map("delete_error") |  |  |
| deletedAt | DateTime | sí | @map("deleted_at") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| updatedAt | DateTime | no | @updatedAt @map("updated_at") |  |  |
| uploadedBy | → User | sí | @relation(fields: [uploadedByUserId], references: [id], onDelete: SetNull) |  |  |
| promotionDocuments | → PromotionDocument[] | no |  |  |  |
| courseResources | → CourseResource[] | no |  |  |  |
| courseAssets | → CourseAsset[] | no |  |  |  |
| guideCourses | → Course[] | no | @relation("CourseGuidePdf") |  |  |

Índices y restricciones:

- `@@unique([s3Bucket, s3Key])`
- `@@index([entityType, entityId])`
- `@@index([uploadedByUserId])`
- `@@index([status])`

### NewsItem (`news_items`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| slug | String | sí | @unique |  |  |
| sourceName | String | no | @map("source_name") | P |  |
| sourceUrl | String | no | @map("source_url") |  |  |
| itemUrl | String | no | @unique @map("item_url") |  |  |
| title | String | no |  |  |  |
| rawText | String | sí | @map("raw_text") |  |  |
| summary | String | sí |  |  |  |
| body | String | sí |  |  |  |
| practicalImpact | String | sí | @map("practical_impact") |  |  |
| relevance | String | no |  |  |  |
| category | String | no | @default("general") |  |  |
| topic | String | sí |  |  |  |
| municipality | String | sí |  |  |  |
| editorialStatus | NewsEditorialStatus | no | @default(draft) @map("editorial_status") |  |  |
| groundingIssues | Json | sí | @map("grounding_issues") |  |  |
| correctionNote | String | sí | @map("correction_note") |  |  |
| reviewedAt | DateTime | sí | @map("reviewed_at") |  |  |
| coverImageUrl | String | sí | @map("cover_image_url") |  |  |
| coverImageAssetId | String | sí | @map("cover_image_asset_id") |  |  |
| contentHash | String | no | @unique @map("content_hash") |  |  |
| publishedAt | DateTime | no | @map("published_at") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |

Índices y restricciones:

- `@@index([publishedAt], map: "idx_news_items_published_at")`
- `@@index([category, publishedAt])`
- `@@index([editorialStatus, publishedAt])`

### WaitlistLead (`waitlist_leads`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| email | String | no |  | P |  |
| product | String | no |  |  |  |
| municipality | String | sí |  |  |  |
| waitlistConsentAt | DateTime | no | @map("waitlist_consent_at") |  |  |
| marketingConsentAt | DateTime | sí | @map("marketing_consent_at") |  |  |
| sourcePath | String | sí | @map("source_path") |  |  |
| userId | String | sí | @map("user_id") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| user | → User | sí | @relation(fields: [userId], references: [id], onDelete: SetNull) |  |  |

Índices y restricciones:

- `@@unique([email, product])`
- `@@index([createdAt])`
- `@@index([userId])`

### NewsFeedItem (`news_feed_items`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| contentHash | String | no | @unique @map("content_hash") |  |  |
| feedUrl | String | no | @map("feed_url") |  |  |
| sourceName | String | no | @map("source_name") | P |  |
| sourceUrl | String | no | @map("source_url") |  |  |
| title | String | no |  |  |  |
| link | String | no | @map("link") |  |  |
| snippet | String | sí | @map("snippet") |  |  |
| publishedAt | DateTime | no | @map("published_at") |  |  |
| category | String | sí | @map("category") |  |  |
| relevanceScore | Int | no | @default(0) @map("relevance_score") |  |  |
| matchedKeywords | Json | sí | @map("matched_keywords") |  |  |
| selectedAt | DateTime | sí | @map("selected_at") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| updatedAt | DateTime | no | @updatedAt @map("updated_at") |  |  |

Índices y restricciones:

- `@@index([publishedAt, relevanceScore])`
- `@@index([category, selectedAt])`

### SystemSetting (`system_settings`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| key | String | no | @unique |  |  |
| value | Json | sí |  |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |
| updatedAt | DateTime | no | @updatedAt @map("updated_at") |  |  |

### JobRun (`job_runs`)

| Campo | Tipo | Nulo | Atributos | Datos | Notas |
|---|---|---|---|---|---|
| id | String | no | @id @default(cuid()) |  |  |
| jobName | String | no | @map("job_name") | P |  |
| status | JobRunStatus | no |  |  |  |
| startedAt | DateTime | no | @map("started_at") |  |  |
| finishedAt | DateTime | sí | @map("finished_at") |  |  |
| resultJson | Json | sí | @map("result_json") |  |  |
| errorMessage | String | sí | @map("error_message") |  |  |
| createdAt | DateTime | no | @default(now()) @map("created_at") |  |  |

Índices y restricciones:

- `@@index([jobName, startedAt])`
- `@@index([startedAt])`
- `@@index([status, startedAt])`

## Enums

| Enum | Valores |
|---|---|
| UserRole | `user`, `admin` |
| UserPlan | `free`, `pro` |
| PromotionType | `venta`, `alquiler`, `mixto`, `desconocido` |
| TargetScope | `municipal`, `catalunya`, `estatal`, `otro` |
| PromotionStatus | `pending_review`, `published_unreviewed`, `published_reviewed`, `archived` |
| PromotionDocumentKind | `pdf_original`, `screenshot`, `image`, `support_document` |
| JobRunStatus | `running`, `success`, `failed` |
| CourseStatus | `draft`, `published`, `archived` |
| CourseAccessType | `free`, `paid`, `pro`, `seguimiento` |
| CoursePricingType | `free`, `premium` |
| CourseFormat | `standard`, `guide_pdf` |
| CourseModuleVisibility | `visible`, `hidden` |
| LessonStatus | `draft`, `published` |
| NewsEditorialStatus | `draft`, `published`, `archived` |
| LessonType | `text`, `video`, `downloadable`, `faq` |
| CourseResourceKind | `image`, `video`, `file` |
| CourseContentBlockType | `heading`, `paragraph`, `image`, `video`, `document`, `list`, `quote`, `divider`, `callout`, `button`, `gallery`, `attachments` |
| CourseAssetKind | `cover`, `image`, `video`, `document`, `attachment` |
| FileEntityType | `promotion`, `alert`, `course`, `module`, `lesson`, `news`, `service` |
| FileAssetStatus | `active`, `deleted`, `delete_failed` |
| CourseAccessRuleType | `plan`, `entitlement`, `purchase`, `subscription`, `service` |
| LessonProgressStatus | `not_started`, `in_progress`, `completed` |
| PurchaseStatus | `pending`, `paid`, `refunded`, `canceled` |
| SubscriptionStatus | `trialing`, `active`, `past_due`, `canceled`, `expired` |
| AudienceType | `normal`, `pro` |
| ServiceStatus | `active`, `inactive`, `archived` |
| ServiceType | `one_time`, `subscription`, `manual` |
| FavoriteStage | `interested`, `preparing`, `applied`, `discarded` |
