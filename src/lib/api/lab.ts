import { apiClient } from './axios';

export const labApi = {
  getLabsPublic: async (params?: { lat?: number; lng?: number; location?: string, isTrusted?: boolean, search?: string }) => {
    const response = await apiClient.get('/labs', { params });
    return response.data;
  },
  
  getLabByIdPublic: async (id: string) => {
    const response = await apiClient.get(`/labs/${id}`);
    return response.data;
  },

  getLabAvailability: async (id: string, date: string) => {
    const response = await apiClient.get(`/labs/${id}/availability`, { params: { date } });
    return response.data;
  },

  submitResult: async (bookingId: string, data: { reportUrl: string }) => {
    const response = await apiClient.patch(`/labs/booking/${bookingId}/result`, data);
    return response.data;
  },

  getMyLabProfile: async () => {
    const response = await apiClient.get('/lab-portal/profile');
    return response.data;
  },

  updateMyLabProfile: async (data: any) => {
    const response = await apiClient.patch('/lab-portal/profile', data);
    return response.data;
  },

  getMyLabBookings: async () => {
    const response = await apiClient.get('/lab-portal/bookings');
    return response.data;
  },
  
  updateLabBookingStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/lab-portal/bookings/${id}/status`, { status });
    return response.data;
  },

  updateCollectionDetails: async (id: string, data: { status?: string; collectorName?: string; collectorContact?: string; notifyDelay?: boolean }) => {
    const response = await apiClient.patch(`/lab-portal/bookings/${id}/collection`, data);
    return response.data;
  },

  getMyLabTests: async () => {
    const response = await apiClient.get('/lab-portal/tests');
    return response.data;
  },

  getPlatformTests: async () => {
    const response = await apiClient.get('/lab-portal/platform-tests');
    return response.data;
  },

  addExistingTestToLab: async (testId: string) => {
    const response = await apiClient.post('/lab-portal/tests/add-existing', { testId });
    return response.data;
  },
  
  createMyLabTest: async (data: any) => {
    const response = await apiClient.post('/lab-portal/tests', data);
    return response.data;
  },

  updateMyLabTest: async (id: string, data: any) => {
    const response = await apiClient.put(`/lab-portal/tests/${id}`, data);
    return response.data;
  },

  getMyLabPackages: async () => {
    const response = await apiClient.get('/lab-portal/packages');
    return response.data;
  },

  getPlatformPackages: async () => {
    const response = await apiClient.get('/lab-portal/platform-packages');
    return response.data;
  },

  addExistingPackageToLab: async (packageId: string) => {
    const response = await apiClient.post('/lab-portal/packages/add-existing', { packageId });
    return response.data;
  },

  createMyLabPackage: async (data: any) => {
    const response = await apiClient.post('/lab-portal/packages', data);
    return response.data;
  },

  updateMyLabPackage: async (id: string, data: any) => {
    const response = await apiClient.put(`/lab-portal/packages/${id}`, data);
    return response.data;
  }
};
