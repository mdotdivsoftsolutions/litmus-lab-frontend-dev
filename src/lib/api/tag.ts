import { apiClient } from './axios';

export const tagApi = {
  getTags: async () => {
    const response = await apiClient.get('/tags');
    return response.data;
  },

  createTag: async (data: { name: string }) => {
    const response = await apiClient.post('/tags', data);
    return response.data;
  },

  deleteTag: async (id: string) => {
    const response = await apiClient.delete(`/tags/${id}`);
    return response.data;
  }
};
