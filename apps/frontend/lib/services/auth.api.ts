import { request } from './core.api';

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await request<{ message: string; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.token);
    }
    return response.user;
  },

  signup: async (name: string, email: string, password: string) => {
    const response = await request<{ message: string; token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.token);
    }
    return response.user;
  },

  getMe: () => request<any>('/auth/me'),

  getWardens: () => request<any[]>('/auth/wardens'),

  logout: () =>
    request<any>('/auth/logout', {
      method: 'POST',
    }),
};
