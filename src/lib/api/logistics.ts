import { apiClient as api } from './axios';

export const logisticsApi = {
  getLogisticsOptions: async () => {
    const res = await api.get('/logistics');
    return res.data;
  },
  createLogisticsOption: async (data: { name: string }) => {
    const res = await api.post('/logistics', data);
    return res.data;
  },
  deleteLogisticsOption: async (id: string) => {
    const res = await api.delete(`/logistics/${id}`);
    return res.data;
  }
};
