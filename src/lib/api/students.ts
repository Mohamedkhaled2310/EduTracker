import { apiFetch } from './config';
import type { ApiResponse, Student, StudentDetails, CreateStudentRequest, PaginatedResponse } from './types';

interface GetStudentsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  grade?: string;
}

export const studentsApi = {
  getAll: async (params: GetStudentsParams = {}): Promise<PaginatedResponse<Student>> => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.status) searchParams.append('status', params.status);
    if (params.search) searchParams.append('search', params.search);
    if (params.grade) searchParams.append('grade', params.grade);
    
    const queryString = searchParams.toString();
    return apiFetch<PaginatedResponse<Student>>(`/students/all-student${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: number): Promise<ApiResponse<StudentDetails>> => {
    return apiFetch<ApiResponse<StudentDetails>>(`/students/spacific-student/${id}`);
  },

  create: async (data: CreateStudentRequest): Promise<ApiResponse<{ id: number; studentId: string }>> => {
    return apiFetch('/students/create-student', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<CreateStudentRequest>): Promise<ApiResponse<null>> => {
    return apiFetch(`/students/spacific-student/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    return apiFetch(`/students/spacific-student/${id}`, {
      method: 'DELETE',
    });
  },
};
