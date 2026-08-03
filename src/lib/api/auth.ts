import { apiClient } from './axios';

// Local type definitions (extracted from backend validators)
export interface RegisterInput {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  phone: string;
  role?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SendOtpInput {
  email: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  otp: string;
  newPassword: string;
}

export const authApi = {
  sendOtp: async (data: SendOtpInput) => {
    const response = await apiClient.post('/auth/send-otp', data);
    return response.data;
  },
  
  register: async (data: RegisterInput & { otp: string }) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginInput) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordInput) => {
    const response = await apiClient.post('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordInput) => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await apiClient.patch('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data: any) => {
    const response = await apiClient.post('/auth/change-password', data);
    return response.data;
  }
};
