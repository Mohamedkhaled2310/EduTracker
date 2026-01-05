import { apiFetch } from './config';
import type { ApiResponse, Communication, SendCommunicationRequest } from './types';

export const communicationsApi = {
  getParentCommunications: async (parentId: number): Promise<ApiResponse<Communication[]>> => {
    return apiFetch<ApiResponse<Communication[]>>(`/communications/parent/${parentId}`);
  },

  send: async (data: SendCommunicationRequest): Promise<ApiResponse<{ messageId: number; status: string }>> => {
    return apiFetch('/communications/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
