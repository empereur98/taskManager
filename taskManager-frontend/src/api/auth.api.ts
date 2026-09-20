import { apiClient } from './client';
import type { AuthResponse, User } from '../types';

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

  register: async (credentials: RegisterPayload): Promise<User> => {
    return apiClient<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
      requiresAuth: false,
    });
  },
};
