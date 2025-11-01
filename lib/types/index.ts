// ============================================================================
// TYPES INDEX
// ============================================================================
// Centralized export of all TypeScript type definitions
// ============================================================================

// Database types
export type { Database, Tables, TablesInsert, TablesUpdate, Enums, Json } from './database'

// Extended database types (new features from migration 005)
export type {
  DatabaseExtended,
  TablesExtended,
  TableExtended,
  TableInsertExtended,
  TableUpdateExtended,
  // New table types
  PropertyView,
  LawyerReview as LawyerReviewExtended,
  SavedSearch,
  SearchAlertHistory,
  FavoriteProperty,
  PropertyComparison,
  Referral,
  PropertyVerification,
  NotificationPreference,
  EmailQueue,
  PlatformSetting,
  // Extended models
  ProfileExtended,
  PropertyExtended,
  LawyerExtended,
  // Relations
  LawyerReviewWithRelations,
  SavedSearchWithCount,
  ReferralWithProfiles,
  PropertyViewsAnalytics,
  LawyerPerformanceMetrics,
  // New enums
  ReviewerRole,
  ReferralStatus,
  ReferralType,
  VerificationType,
  VerificationStatus,
  VerificationLevel,
  EmailStatus,
  AlertFrequency,
} from './database-extended'

// Domain model types
export type {
  User,
  Profile,
  Country,
  Property,
  PropertyImage,
  PropertyWithDetails,
  PropertyFilters,
  Inquiry,
  InquiryWithRelations,
  Lawyer,
  LawyerWithDetails,
  LawyerReview,
  Transaction,
  TransactionWithDetails,
  DealClosureInput,
  FeeRemittance,
  LawyerReconciliationReport,
  RemittanceSubmission,
  Conversation,
  Message,
  ConversationWithDetails,
  Notification,
  Document,
  SavingsCalculation,
  FormattedSavings,
  ApiResponse,
  PaginatedResponse,
  LoginFormData,
  RegisterFormData,
  PropertyFormData,
  InquiryFormData,
  LawyerOnboardingFormData,
  SortDirection,
  SortConfig,
  PaginationConfig,
  DeepPartial,
  RequiredFields,
  Optional,
} from './models'
