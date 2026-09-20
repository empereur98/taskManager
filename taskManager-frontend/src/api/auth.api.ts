import { apiClient } from './client';
import type { AuthResponse } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
}

export const authApi = {
  login: async (credentials: LoginPayload): Promise<AuthResponse> => {
    return apiClient<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      requiresAuth: false,
    });
  },

  register: async (credentials: RegisterPayload): Promise<{ message?: string; [key: string]: any }> => {
    return apiClient<{ message?: string; [key: string]: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
      requiresAuth: false,
    });
  },
};
