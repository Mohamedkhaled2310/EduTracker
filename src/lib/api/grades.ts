import { apiFetch } from './config';
import type { ApiResponse, StudentGrades, RecordGradeRequest } from './types';

interface GetGradesParams {
  semester?: number;
  year?: string;
}

export const gradesApi = {
  getStudentGrades: async (studentId: string, params: GetGradesParams = {}): Promise<ApiResponse<StudentGrades>> => {
    const searchParams = new URLSearchParams();
    if (params.semester) searchParams.append('semester', params.semester.toString());
    if (params.year) searchParams.append('year', params.year);
    
    const queryString = searchParams.toString();
    return apiFetch<ApiResponse<StudentGrades>>(`/grades/student/${studentId}${queryString ? `?${queryString}` : ''}`);
  },

  record: async (data: RecordGradeRequest): Promise<ApiResponse<null>> => {
    return apiFetch('/grades', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (data: Omit<RecordGradeRequest, 'maxScore'>): Promise<ApiResponse<null>> => {
    return apiFetch('/grades', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (data: { studentId: number; subjectId: number; semester: number; year: string }): Promise<ApiResponse<null>> => {
    return apiFetch('/grades', {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  },
};
