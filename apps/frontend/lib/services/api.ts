/**
 * API Façade
 * 
 * Re-exports all domain-specific API modules to maintain backward compatibility,
 * while allowing the actual implementation to be split into separate files (SRP).
 */

import { authApi } from './auth.api';
import { roomApi } from './room.api';
import { bookingApi } from './booking.api';
import { request } from './core.api';

// Re-export specific methods for notifications that didn't fit into the main domains
const notificationApi = {
  getNotifications: () => request<any[]>('/notifications'),
  markNotificationAsRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
  deleteNotification: (id: string) => request<any>(`/notifications/${id}`, { method: 'DELETE' }),
};

export const api = {
  ...authApi,
  ...roomApi,
  ...bookingApi,
  ...notificationApi,
};
