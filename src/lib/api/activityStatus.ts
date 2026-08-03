import { apiClient as api } from './axios';

export const activityStatusApi = {
  getActivityStatuses: async () => {
    const res = await api.get('/activity-status');
    return res.data;
  },
  createActivityStatus: async (data: { name: string }) => {
    const res = await api.post('/activity-status', data);
    return res.data;
  },
  deleteActivityStatus: async (id: string) => {
    const res = await api.delete(`/activity-status/${id}`);
    return res.data;
  },
};
