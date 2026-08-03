import { apiClient as api } from './axios';

export const infrastructureApi = {
  getInfrastructureOptions: async () => {
    const res = await api.get('/infrastructure');
    return res.data;
  },
  createInfrastructureOption: async (data: { title: string; description: string; icon: string }) => {
    const res = await api.post('/infrastructure', data);
    return res.data;
  },
  deleteInfrastructureOption: async (id: string) => {
    const res = await api.delete(`/infrastructure/${id}`);
    return res.data;
  }
};
