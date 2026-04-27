/**
 * Frontend Types
 * 
 * DRY Principle: Re-exports canonical types from @unilodge/shared.
 * Only frontend-specific UI types are defined locally.
 */

// Re-export all shared types — single source of truth
export {
  Role,
  BookingStatus,
  PaymentStatus,
  NotificationType,
  type User,
  type Room,
  type Booking,
  type ChatMessage,
  type PriceSuggestion,
  type Notification,
} from '../../packages/shared/src/types';
