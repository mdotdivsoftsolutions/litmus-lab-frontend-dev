import { apiClient } from './axios';

export const bookingApi = {
  createBooking: async (data: { labId: string; items: any[]; bookingDate: Date; totalAmount: number }) => {
    const response = await apiClient.post('/booking', data);
    return response.data;
  },
  
  getMyBookings: async () => {
    const response = await apiClient.get('/booking/my');
    return response.data;
  },

  getBookingById: async (id: string) => {
    const response = await apiClient.get(`/booking/${id}`);
    return response.data;
  }
};
