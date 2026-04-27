import { request } from './core.api';

export const roomApi = {
  getRooms: (params?: { type?: string; minPrice?: number; maxPrice?: number; available?: boolean; search?: string }) => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request<any[]>('/rooms' + query);
  },

  getRoom: (id: string) => request<any>(`/rooms/${id}`),

  createRoom: (data: any) =>
    request<any>('/rooms', {
      method: 'POST',
      body: data,
    }),

  updateRoom: (id: string, data: any) =>
    request<any>(`/rooms/${id}`, {
      method: 'PUT',
      body: data,
    }),

  deleteRoom: (id: string) =>
    request<void>(`/rooms/${id}`, {
      method: 'DELETE',
    }),

  getPendingRooms: () => request<any[]>('/rooms/pending'),

  approveRoom: (id: string) =>
    request<any>(`/rooms/${id}/approve`, {
      method: 'PATCH',
    }),

  rejectRoom: (id: string) =>
    request<any>(`/rooms/${id}/reject`, {
      method: 'PATCH',
    }),
};
