import { apiClient } from './axios';

export interface BookingInvoiceSummary {
  available: boolean;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  fileName: string | null;
  mimeType: string | null;
  size: number | null;
  uploadedAt: string | null;
}

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
  },

  /** Metadata of the invoice uploaded by the Litmus team (available=false until issued). */
  getBookingInvoice: async (bookingId: string): Promise<{ success: boolean; data: BookingInvoiceSummary }> => {
    const response = await apiClient.get(`/booking/${bookingId}/invoice`);
    return response.data;
  },

  downloadBookingInvoice: async (bookingId: string): Promise<Blob> => {
    const response = await apiClient.get(`/booking/${bookingId}/invoice/download`, { responseType: "blob" });
    return response.data as Blob;
  }
};
