import { apiClient } from './axios';

export const productApi = {
  getProducts: () => apiClient.get('/products'),
  getProduct: (id: string) => apiClient.get(`/products/${id}`),
  createProduct: (data: Record<string, unknown>) => apiClient.post('/products', data),
  updateProduct: (id: string, data: Record<string, unknown>) => apiClient.patch(`/products/${id}`, data),
  deleteProduct: (id: string) => apiClient.delete(`/products/${id}`),
};
