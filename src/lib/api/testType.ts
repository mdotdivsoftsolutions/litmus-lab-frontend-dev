import { apiClient } from './axios';

export const testTypeApi = {
  getTestTypes: async () => {
    const response = await apiClient.get('/test-types');
    return response.data;
  },

  createTestType: async (data: { name: string }) => {
    const response = await apiClient.post('/test-types', data);
    return response.data;
  },

  deleteTestType: async (id: string) => {
    const response = await apiClient.delete(`/test-types/${id}`);
    return response.data;
  }
};
