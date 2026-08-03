import { apiClient } from './axios';

export const reviewApi = {
  getPublicReviews: async () => {
    const response = await apiClient.get('/reviews/public');
    return response.data;
  },
};
