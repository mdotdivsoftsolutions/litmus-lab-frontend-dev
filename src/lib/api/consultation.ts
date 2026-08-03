import { apiClient } from './axios';

export interface ConsultationData {
  name: string;
  business?: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  serviceName: string;
  source: string;
}

export const consultationApi = {
  createConsultation: (data: ConsultationData) => apiClient.post('/consultations', data),
  getConsultations: () => apiClient.get('/consultations'),
  updateStatus: (id: string, status: string) => apiClient.patch(`/consultations/${id}/status`, { status }),
};
