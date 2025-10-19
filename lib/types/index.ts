// ============================================================================
// TYPES INDEX
// ============================================================================
// Centralized export of all TypeScript type definitions
// ============================================================================

// Database types
export type { Database, Tables, TablesInsert, TablesUpdate, Enums, Json } from './database'

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
