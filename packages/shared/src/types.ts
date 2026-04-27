/**
 * @unilodge/shared — Single Source of Truth for all types
 * 
 * Design Principles:
 * - DRY: All types defined here ONCE, re-exported everywhere
 * - Validation: Zod schemas for runtime validation (used in API routes)
 * - Consistency: Canonical field names used across frontend, backend, and AI engine
 */

import { z } from 'zod';

// ============================================================
// Enums
// ============================================================

/** User roles — consistent across all apps */
export enum Role {
  GUEST = 'GUEST',
  WARDEN = 'WARDEN',
  ADMIN = 'ADMIN',
}

/** Booking statuses — canonical list */
export enum BookingStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  CANCELLED = 'Cancelled',
  CHECKED_IN = 'CheckedIn',
  CHECKED_OUT = 'CheckedOut',
}

/** Payment statuses */
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

/** Notification types */
export enum NotificationType {
  REJECTION = 'rejection',
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
}

// ============================================================
// Zod Schemas (Runtime validation)
// ============================================================

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.nativeEnum(Role),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const RoomSchema = z.object({
  id: z.string(),
  roomNumber: z.string(),
  type: z.enum(['Single', 'Double', 'Suite']),
  price: z.number().positive(),
  amenities: z.array(z.string()).default([]),
  rating: z.number().min(0).max(5).default(0),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean().default(true),
  description: z.string().optional(),
  capacity: z.number().positive().optional(),
  university: z.string().optional(),
  location: z.string().optional(),
  building: z.string().optional(),
});

export const BookingSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  userId: z.string(),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  status: z.nativeEnum(BookingStatus).default(BookingStatus.PENDING),
  totalPrice: z.number().optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  room: RoomSchema.optional(),
  actualCheckIn: z.string().optional(),
  actualCheckOut: z.string().optional(),
  checkInCompleted: z.boolean().optional(),
  checkOutCompleted: z.boolean().optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  user: UserSchema.optional(),
});

export const ChatMessageSchema = z.object({
  id: z.string(),
  text: z.string(),
  sender: z.enum(['user', 'ai']),
  isLoading: z.boolean().optional().default(false),
  timestamp: z.coerce.date().optional(),
});

export const PriceSuggestionSchema = z.object({
  suggestedPrice: z.number().positive(),
  reasoning: z.string(),
});

export const NotificationSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  type: z.nativeEnum(NotificationType),
  title: z.string(),
  message: z.string(),
  relatedId: z.string().optional(),
  relatedType: z.enum(['booking-request', 'room', 'booking']).optional(),
  read: z.boolean().default(false),
  createdAt: z.string(),
  expiresAt: z.string().optional(),
});

// ============================================================
// TypeScript Types (inferred from Zod schemas)
// ============================================================

export type User = z.infer<typeof UserSchema>;
export type Room = z.infer<typeof RoomSchema>;
export type Booking = z.infer<typeof BookingSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type PriceSuggestion = z.infer<typeof PriceSuggestionSchema>;
export type Notification = z.infer<typeof NotificationSchema>;

// ============================================================
// API Response Types (Generic wrappers)
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================
// Result Type (Functional error handling)
// ============================================================

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// ============================================================
// Utility Types
// ============================================================

export interface FilterOptions {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
  filters?: Record<string, unknown>;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
  currency: string;
}
