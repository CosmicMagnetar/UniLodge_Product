import { request } from './core.api';

export const bookingApi = {
  getBookings: (params?: { paymentStatus?: string }) => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request<any[]>('/bookings' + query);
  },

  getBooking: (id: string) => request<any>(`/bookings/${id}`),

  createBooking: (roomId: string, checkInDate: string, checkOutDate: string) =>
    request<any>('/bookings', {
      method: 'POST',
      body: { roomId, checkInDate, checkOutDate },
    }),

  updateBookingStatus: (id: string, status: string) =>
    request<any>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: { status },
    }),

  // Booking Requests
  createBookingRequest: (data: { roomId: string; checkInDate: string; checkOutDate: string; message: string }) =>
    request<any>('/booking-requests', {
      method: 'POST',
      body: data,
    }),

  getAllBookingRequests: (params?: { status?: string }) => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request<any[]>('/booking-requests' + query);
  },

  getUserBookingRequests: () => request<any[]>('/booking-requests/my-requests'),

  approveBookingRequest: (id: string) =>
    request<any>(`/booking-requests/${id}/approve`, {
      method: 'POST'
    }),

  rejectBookingRequest: (id: string) =>
    request<any>(`/booking-requests/${id}/reject`, {
      method: 'POST'
    }),

  // Analytics
  getAnalytics: () => request<any>('/analytics'),

  // Payment & Check-in
  payBooking: (id: string, paymentMethod: string) =>
    request<any>(`/bookings/${id}/payment`, {
      method: 'POST',
      body: { paymentMethod }
    }),

  checkIn: (id: string) =>
    request<any>(`/bookings/${id}/checkin`, {
      method: 'POST'
    }),

  checkOut: (id: string) =>
    request<any>(`/bookings/${id}/checkout`, {
      method: 'POST'
    }),
};
