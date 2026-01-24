import { apiFetch } from './config';
import type { ApiResponse, Subject, SubjectDetails, CreateSubjectRequest } from './types';

interface GetSubjectsParams {
  gradeLevel?: string;
  status?: string;
  subjectType?: string;
}

export const subjectsApi = {
  getAll: async (params: GetSubjectsParams = {}): Promise<ApiResponse<Subject[]>> => {
    const searchParams = new URLSearchParams();
    if (params.gradeLevel) searchParams.append('gradeLevel', params.gradeLevel);
    if (params.status) searchParams.append('status', params.status);
    if (params.subjectType) searchParams.append('subjectType', params.subjectType);

    const queryString = searchParams.toString();
    return apiFetch<ApiResponse<Subject[]>>(`/subjects${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: number): Promise<ApiResponse<SubjectDetails>> => {
    return apiFetch<ApiResponse<SubjectDetails>>(`/subjects/${id}`);
  },

  create: async (data: CreateSubjectRequest): Promise<ApiResponse<{ id: number; name: string; code: string }>> => {
    return apiFetch('/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<CreateSubjectRequest>): Promise<ApiResponse<null>> => {
    return apiFetch(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    return apiFetch(`/subjects/${id}`, {
      method: 'DELETE',
    });
  },
};
