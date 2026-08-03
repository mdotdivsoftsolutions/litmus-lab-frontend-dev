import { apiClient } from './axios';

// Helper to get or create a session ID for guest users
const getSessionId = () => {
  let sessionId = localStorage.getItem('litmus_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    localStorage.setItem('litmus_session_id', sessionId);
  }
  return sessionId;
};

// Interceptor to attach session ID to every cart request
apiClient.interceptors.request.use((config) => {
  if (config.url?.includes('/cart')) {
    config.headers['x-session-id'] = getSessionId();
  }
  return config;
});

export const cartApi = {
  getCart: async () => {
    const response = await apiClient.get('/cart');
    return response.data;
  },

  addToCart: async (data: { itemType: 'TEST' | 'PACKAGE'; testId?: string; packageId?: string; parameters?: string[] }) => {
    const response = await apiClient.post('/cart/add', data);
    return response.data;
  },

  removeFromCart: async (itemId: string) => {
    const response = await apiClient.delete(`/cart/remove/${itemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await apiClient.delete('/cart/clear');
    return response.data;
  },
};
