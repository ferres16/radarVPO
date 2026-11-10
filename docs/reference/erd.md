# Diagramas entidad-relación (Mermaid)

> Generado por `scripts/generate-reference-docs.mjs`. No editar a mano: ejecuta `npm run docs:reference`.

Un diagrama por módulo. Las relaciones con modelos de otros módulos se dibujan con la entidad externa sin atributos.

## Identidad y sesiones

```mermaid
erDiagram
  User {
    String id PK
    String email UK
    String fullName
    String phone
    String passwordHash
    UserRole role
    UserPlan plan
    DateTime emailVerifiedAt
    DateTime marketingOptInAt
    String marketingOptInVersion
    DateTime marketingOptOutAt
    Boolean smsAlertsEnabled
    Json alertMunicipalityIds
    Json alertPromotionTypes
    String stripeCustomerId
    DateTime proCancellationRequestedAt
    DateTime createdAt
    DateTime updatedAt
    DateTime lastLoginAt
  }
  PasswordResetToken {
    String id PK
    String userId FK
    String tokenHash UK
    DateTime expiresAt
    DateTime usedAt
    DateTime createdAt
  }
  EmailVerificationToken {
    String id PK
    String userId FK
    String tokenHash UK
    DateTime expiresAt
    DateTime usedAt
    DateTime createdAt
  }
  Session {
    String id PK
    String userId FK
    String refreshTokenHash
    DateTime expiresAt
    DateTime revokedAt
    DateTime createdAt
  }
  AuditLog {
    String id PK
    String userId FK
    String action
    String entity
    String entityId
    Json metadata
    DateTime createdAt
  }
  User ||--o{ PasswordResetToken : "user"
  User ||--o{ EmailVerificationToken : "user"
  User ||--o{ Session : "user"
  User |o--o{ AuditLog : "user"
```

## Comercio y pagos

```mermaid
erDiagram
  StripeProcessedEvent {
    String eventId PK
    String type
    String status
    String errorMessage
    DateTime createdAt
    DateTime processedAt
  }
  CommercePromoRule {
    String id PK
    String key UK
    String name
    String ruleType
    Boolean enabled
    Json config
    DateTime createdAt
    DateTime updatedAt
  }
  Service {
    String id PK
    String key UK
    String name
    String description
    Decimal price
    Decimal salePrice
    String currency
    ServiceStatus status
    ServiceType serviceType
    String stripePaymentLink
    DateTime createdAt
    DateTime updatedAt
  }
  UserServiceAccess {
    String id PK
    String userId FK
    String serviceId FK
    Boolean isActive
    DateTime activatedAt
    String activatedBy
    Boolean activatedByAdmin
    String notes
    DateTime createdAt
    DateTime updatedAt
  }
  UserEntitlement {
    String id PK
    String userId FK
    String key
    String source
    String sourceId
    DateTime startsAt
    DateTime endsAt
    DateTime createdAt
  }
  Purchase {
    String id PK
    String userId FK
    String courseId FK
    String provider
    String providerRef
    String productKey
    PurchaseStatus status
    Decimal amount
    String currency
    DateTime purchasedAt
    DateTime createdAt
  }
  PurchaseConsent {
    String id PK
    String userId FK
    String purchaseId UK
    String stripeSessionId UK
    String productKey
    String courseId
    String termsVersion
    String termsTextSnapshot
    DateTime termsAcceptedAt
    String immediateConsentVersion
    String immediateTextSnapshot
    DateTime immediateAcceptedAt
    String confirmationEmailStatus
    DateTime confirmationEmailSentAt
    String confirmationEmailError
    DateTime firstContentOpenedAt
    DateTime lastContentOpenedAt
    DateTime accessGrantedAt
    DateTime createdAt
    DateTime updatedAt
  }
  Subscription {
    String id PK
    String userId FK
    String provider
    String providerRef
    SubscriptionStatus status
    String planKey
    DateTime currentPeriodStart
    DateTime currentPeriodEnd
    DateTime cancelAt
    DateTime createdAt
  }
  User ||--o{ UserServiceAccess : "user"
  Service ||--o{ UserServiceAccess : "service"
  User ||--o{ UserEntitlement : "user"
  User ||--o{ Purchase : "user"
  Course |o--o{ Purchase : "course"
  User ||--o{ PurchaseConsent : "user"
  Purchase |o--o{ PurchaseConsent : "purchase"
  User ||--o{ Subscription : "user"
```

## Cursos y guía

```mermaid
erDiagram
  Course {
    String id PK
    String title
    String slug UK
    String shortDescription
    String longDescription
    String coverImage
    CoursePricingType pricingType
    Decimal price
    Decimal salePrice
    String currency
    String stripePaymentLink
    CourseStatus status
    CourseAccessType accessType
    CourseFormat format
    String guidePdfAssetId FK
    Int order
    String seoTitle
    String seoDescription
    Json seoMetadata
    DateTime publishedAt
    DateTime createdAt
    DateTime updatedAt
  }
  CourseModule {
    String id PK
    String courseId FK
    String title
    String description
    Int order
    CourseModuleVisibility visibility
    DateTime createdAt
    DateTime updatedAt
  }
  CourseLesson {
    String id PK
    String courseId FK
    String moduleId FK
    String title
    String slug
    String summary
    Json contentJson
    Int order
    Int durationMinutes
    LessonStatus status
    LessonType type
    DateTime createdAt
    DateTime updatedAt
  }
  CourseContentBlock {
    String id PK
    String lessonId FK
    CourseContentBlockType type
    Json content
    Int order
    DateTime createdAt
    DateTime updatedAt
  }
  CourseAsset {
    String id PK
    String courseId FK
    String moduleId FK
    String lessonId FK
    String blockId FK
    String fileAssetId FK
    CourseAssetKind kind
    String originalName
    String mimeType
    Int size
    String s3Key
    String url
    Boolean isPublic
    String altText
    String caption
    DateTime createdAt
  }
  CourseResource {
    String id PK
    String courseId FK
    String moduleId FK
    String lessonId FK
    String fileAssetId FK
    CourseResourceKind kind
    String fileType
    String originalName
    String storagePath
    String publicUrl
    DateTime createdAt
  }
  CourseAccessRule {
    String id PK
    String courseId FK
    CourseAccessRuleType ruleType
    Json configJson
    DateTime createdAt
  }
  UserCourseAccess {
    String id PK
    String userId FK
    String courseId FK
    Boolean isActive
    DateTime activatedAt
    String activatedBy
    Boolean activatedByAdmin
    String notes
    DateTime createdAt
    DateTime updatedAt
  }
  ContentSupplyEvent {
    String id PK
    String userId FK
    String courseId
    String consentId
    String productKey
    String kind
    String path
    DateTime createdAt
  }
  CourseProgress {
    String id PK
    String userId FK
    String courseId FK
    Int progressPercent
    Int completedLessons
    Int totalLessons
    String lastLessonId FK
    DateTime createdAt
    DateTime updatedAt
  }
  LessonProgress {
    String id PK
    String userId FK
    String courseId FK
    String moduleId FK
    String lessonId FK
    LessonProgressStatus status
    DateTime completedAt
    DateTime createdAt
    DateTime updatedAt
  }
  FileAsset |o--o{ Course : "guidePdfAsset"
  Course ||--o{ CourseModule : "course"
  Course ||--o{ CourseLesson : "course"
  CourseModule ||--o{ CourseLesson : "module"
  CourseLesson ||--o{ CourseContentBlock : "lesson"
  Course ||--o{ CourseAsset : "course"
  CourseModule |o--o{ CourseAsset : "module"
  CourseLesson |o--o{ CourseAsset : "lesson"
  CourseContentBlock |o--o{ CourseAsset : "block"
  FileAsset |o--o{ CourseAsset : "fileAsset"
  Course ||--o{ CourseResource : "course"
  CourseModule |o--o{ CourseResource : "module"
  CourseLesson |o--o{ CourseResource : "lesson"
  FileAsset |o--o{ CourseResource : "fileAsset"
  Course ||--o{ CourseAccessRule : "course"
  User ||--o{ UserCourseAccess : "user"
  Course ||--o{ UserCourseAccess : "course"
  User ||--o{ ContentSupplyEvent : "user"
  User ||--o{ CourseProgress : "user"
  Course ||--o{ CourseProgress : "course"
  CourseLesson |o--o{ CourseProgress : "lastLesson"
  User ||--o{ LessonProgress : "user"
  Course ||--o{ LessonProgress : "course"
  CourseModule ||--o{ LessonProgress : "module"
  CourseLesson ||--o{ LessonProgress : "lesson"
```

## Promociones y alertas

```mermaid
erDiagram
  Promotion {
    String id PK
    String sourceId FK
    String title
    String location
    String municipality
    String municipalityRaw
    String municipalityId
    Boolean municipalityNeedsReview
    String province
    String autonomousCommunity
    PromotionType promotionType
    TargetScope targetScope
    String tenureType
    PromotionStatus status
    DateTime publishedAt
    DateTime deadlineDate
    DateTime estimatedPublicationDate
    String sourceUrl
    String rawText
    DateTime alertDetectedAt
    String statusMessage
    DateTime manuallyRemovedAt
    String promoter
    Int totalHomes
    Json generalInfo
    Json importantDates
    Json requirements
    Json economicInfo
    Json feesAndReservations
    Json contactInfo
    String publicDescription
    String availableUnitsText
    Boolean isProOnly
    DateTime createdAt
    DateTime updatedAt
  }
  PromotionDocument {
    String id PK
    String promotionId FK
    String fileAssetId FK
    PromotionDocumentKind documentKind
    String title
    String description
    String altText
    Int sortOrder
    Boolean isFeatured
    Boolean isPublic
    String section
    String reviewStatus
    String fileType
    String originalName
    String storagePath
    String publicUrl
    String uploadedBy
    DateTime createdAt
  }
  PromotionUnit {
    String id PK
    String promotionId FK
    Int rowOrder
    String unitLabel
    String building
    String stair
    String floor
    String door
    Int bedrooms
    Int bathrooms
    Decimal usefulAreaM2
    Decimal builtAreaM2
    Decimal priceSale
    Decimal monthlyRent
    Decimal reservation
    String notes
    Json extraData
    DateTime createdAt
    DateTime updatedAt
  }
  Reminder {
    String id PK
    String userId FK
    String kind
    Json payload
    DateTime remindAt
    DateTime sentAt
    DateTime createdAt
  }
  SavedSearch {
    String id PK
    String userId FK
    String name
    Json filtersJson
    Boolean notificationsOn
    DateTime createdAt
    DateTime updatedAt
  }
  UserAlert {
    String id PK
    String userId FK
    String type
    Boolean enabled
    String channel
    Json configJson
    DateTime createdAt
    DateTime updatedAt
  }
  PromotionFavorite {
    String id PK
    String userId FK
    String promotionId FK
    DateTime createdAt
    DateTime updatedAt
    FavoriteStage stage
    String notes
    String checklistDone
  }
  Source ||--o{ Promotion : "source"
  Promotion ||--o{ PromotionDocument : "promotion"
  FileAsset |o--o{ PromotionDocument : "fileAsset"
  Promotion ||--o{ PromotionUnit : "promotion"
  User ||--o{ Reminder : "user"
  User ||--o{ SavedSearch : "user"
  User ||--o{ UserAlert : "user"
  User ||--o{ PromotionFavorite : "user"
  Promotion ||--o{ PromotionFavorite : "promotion"
```

## Notificaciones

```mermaid
erDiagram
  MessageTemplate {
    String id PK
    String key UK
    String label
    String description
    String channel
    String emailSubject
    String emailBody
    String smsBody
    Boolean active
    Boolean isCustomized
    Int seedRevision
    DateTime createdAt
    DateTime updatedAt
  }
  PublishedPost {
    String id PK
    String sourceKind
    String sourceId
    AudienceType audience
    String channel
    Json payloadJson
    String status
    DateTime sentAt
    DateTime createdAt
  }
  DeliveryFailure {
    String id PK
    String channel
    String target
    String sourceRef
    String errorCode
    Json errorDetail
    DateTime createdAt
  }
  DeliveryLog {
    String id PK
    String channel
    String status
    String target
    String sourceRef
    String errorCode
    Json errorDetail
    String subject
    String content
    Json context
    DateTime createdAt
  }

```

## Contenido, ficheros y operación

```mermaid
erDiagram
  Source {
    String id PK
    String name
    String sourceType
    String baseUrl
    Boolean active
    Json scrapeConfig
    DateTime lastSuccessfulRunAt
    DateTime createdAt
    DateTime updatedAt
  }
  FileAsset {
    String id PK
    FileEntityType entityType
    String entityId
    String fileName
    String originalName
    String mimeType
    Int size
    String s3Key
    String s3Bucket
    String url
    Boolean isPublic
    String uploadedByUserId FK
    FileAssetStatus status
    String deleteError
    DateTime deletedAt
    DateTime createdAt
    DateTime updatedAt
  }
  NewsItem {
    String id PK
    String slug UK
    String sourceName
    String sourceUrl
    String itemUrl UK
    String title
    String rawText
    String summary
    String body
    String practicalImpact
    String relevance
    String category
    String topic
    String municipality
    NewsEditorialStatus editorialStatus
    Json groundingIssues
    String correctionNote
    DateTime reviewedAt
    String coverImageUrl
    String coverImageAssetId
    String contentHash UK
    DateTime publishedAt
    DateTime createdAt
  }
  WaitlistLead {
    String id PK
    String email
    String product
    String municipality
    DateTime waitlistConsentAt
    DateTime marketingConsentAt
    String sourcePath
    String userId FK
    DateTime createdAt
  }
  NewsFeedItem {
    String id PK
    String contentHash UK
    String feedUrl
    String sourceName
    String sourceUrl
    String title
    String link
    String snippet
    DateTime publishedAt
    String category
    Int relevanceScore
    Json matchedKeywords
    DateTime selectedAt
    DateTime createdAt
    DateTime updatedAt
  }
  SystemSetting {
    String id PK
    String key UK
    Json value
    DateTime createdAt
    DateTime updatedAt
  }
  JobRun {
    String id PK
    String jobName
    JobRunStatus status
    DateTime startedAt
    DateTime finishedAt
    Json resultJson
    String errorMessage
    DateTime createdAt
  }
  User |o--o{ FileAsset : "uploadedBy"
  User |o--o{ WaitlistLead : "user"
```

