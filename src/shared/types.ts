/**
 * Shared Types and Utilities
 * Common types and helper functions used across the application
 */

// Common Types
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

export interface FilterOptions {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
  filters?: Record<string, any>;
}

// Result Type
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// Utility Functions
export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function isOk<T>(result: Result<T>): result is { ok: true; value: T } {
  return result.ok === true;
}

export function isErr<E>(result: Result<any, E>): result is { ok: false; error: E } {
  return result.ok === false;
}

// String utilities
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Number utilities
export function roundTo(number: number, decimals: number = 2): number {
  return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Array utilities
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

// Object utilities
export function omit<T extends Record<string, any>>(obj: T, keys: string[]): Partial<T> {
  const result = { ...obj };
  keys.forEach((key) => delete result[key as keyof T]);
  return result;
}

export function pick<T extends Record<string, any>>(obj: T, keys: string[]): Partial<T> {
  const result: any = {};
  keys.forEach((key) => {
    if (key in obj) result[key] = obj[key];
  });
  return result;
}
