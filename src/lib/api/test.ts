import { apiClient } from './axios';

export const testApi = {
  getTests: async (params?: any) => {
    const response = await apiClient.get('/tests', { params });
    return response.data;
  },
  
  getTestById: async (id: string) => {
    const response = await apiClient.get(`/tests/${id}`);
    return response.data;
  },

  createTest: async (data: any) => {
    const response = await apiClient.post('/tests', data);
    return response.data;
  },

  updateTest: async (id: string, data: any) => {
    const response = await apiClient.patch(`/tests/${id}`, data);
    return response.data;
  },

  deleteTest: async (id: string) => {
    const response = await apiClient.delete(`/tests/${id}`);
    return response.data;
  }
};
