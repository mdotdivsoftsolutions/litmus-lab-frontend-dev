import { apiClient } from './axios';

export const labEmployeeApi = {
  getEmployees: async () => {
    const response = await apiClient.get('/lab-employees');
    return response.data;
  },

  createEmployee: async (data: any) => {
    const response = await apiClient.post('/lab-employees', data);
    return response.data;
  },

  updateEmployee: async (id: string, data: any) => {
    const response = await apiClient.put(`/lab-employees/${id}`, data);
    return response.data;
  },

  deleteEmployee: async (id: string) => {
    const response = await apiClient.delete(`/lab-employees/${id}`);
    return response.data;
  }
};
