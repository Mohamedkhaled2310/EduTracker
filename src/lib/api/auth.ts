import { apiFetch } from './config';
import type { LoginRequest, LoginResponse, RegisterAdminRequest, RegisterAdminResponse } from './types';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  registerAdmin: async (data: RegisterAdminRequest): Promise<RegisterAdminResponse> => {
    return apiFetch<RegisterAdminResponse>('/auth/register-admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  logout: async (): Promise<{ status: boolean; message: string }> => {
    return apiFetch('/auth/logout', {
      method: 'POST',
    });
  },
};
