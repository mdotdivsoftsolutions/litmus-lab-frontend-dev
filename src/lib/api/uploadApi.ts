import { apiClient } from './axios';

export const uploadApi = {
  uploadFile: async (file: File, onProgress?: (progressEvent: any) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });
    return response.data;
  },
};
