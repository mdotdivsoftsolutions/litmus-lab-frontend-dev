import { apiClient } from './axios';

export const searchApi = {
  getSuggestions: async (query: string) => {
    const response = await apiClient.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
    return response.data;
  }
};
