/**
 * @unilodge/shared — Package Entry Point
 * 
 * Re-exports all shared types, schemas, and utilities.
 * All apps import from '@unilodge/shared' for type consistency.
 */

// Types, Enums, and Zod Schemas
export {
  // Enums
  Role,
  BookingStatus,
  PaymentStatus,
  NotificationType,

  // Zod Schemas (for runtime validation)
  UserSchema,
  RoomSchema,
  BookingSchema,
  ChatMessageSchema,
  PriceSuggestionSchema,
  NotificationSchema,

  // TypeScript Types
  type User,
  type Room,
  type Booking,
  type ChatMessage,
  type PriceSuggestion,
  type Notification,

  // API Types
  type ApiResponse,
  type PaginatedResponse,

  // Result Type
  type Result,
  ok,
  err,

  // Utility Types
  type FilterOptions,
  type UserPreferences,
} from './types';
