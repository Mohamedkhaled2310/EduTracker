import { apiFetch } from './config';
import type {
  ApiResponse,
  Teacher,
  TeacherDetails,
  CreateTeacherRequest,
  TeacherSupportRecord,
  CreateSupportRecordRequest,
  TeacherOverviewStats
} from './types';

interface GetTeachersParams {
  department?: string;
  status?: string;
}

export const teachersApi = {
  getAll: async (params: GetTeachersParams = {}): Promise<ApiResponse<Teacher[]>> => {
    const searchParams = new URLSearchParams();
    if (params.department) searchParams.append('department', params.department);
    if (params.status) searchParams.append('status', params.status);

    const queryString = searchParams.toString();
    return apiFetch<ApiResponse<Teacher[]>>(`/teachers${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string): Promise<ApiResponse<TeacherDetails>> => {
    return apiFetch<ApiResponse<TeacherDetails>>(`/teachers/${id}`);
  },

  create: async (data: CreateTeacherRequest): Promise<ApiResponse<{ id: number; employeeId: string }>> => {
    return apiFetch('/teachers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<CreateTeacherRequest>): Promise<ApiResponse<null>> => {
    return apiFetch(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  createSupportRecord: async (teacherId: string, data: CreateSupportRecordRequest): Promise<ApiResponse<TeacherSupportRecord>> => {
    return apiFetch(`/teachers/${teacherId}/support-records`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getSupportRecords: async (teacherId: string): Promise<ApiResponse<TeacherSupportRecord[]>> => {
    return apiFetch(`/teachers/${teacherId}/support-records`);
  },

  getStatistics: async (): Promise<ApiResponse<TeacherOverviewStats>> => {
    return apiFetch('/teachers/statistics/overview');
  },
};
