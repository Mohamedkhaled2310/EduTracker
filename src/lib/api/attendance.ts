import { apiFetch } from './config';
import type { ApiResponse, AttendanceRecord, RecordAttendanceRequest, AttendanceHistory } from './types';

interface GetAttendanceParams {
  date: string;
  grade?: string;
  class?: string;
}

export const attendanceApi = {
  get: async (params: GetAttendanceParams): Promise<ApiResponse<AttendanceRecord[]>> => {
    const searchParams = new URLSearchParams();
    searchParams.append('date', params.date);
    if (params.grade) searchParams.append('grade', params.grade);
    if (params.class) searchParams.append('class', params.class);
    
    return apiFetch<ApiResponse<AttendanceRecord[]>>(`/attendance/return-attendance?${searchParams.toString()}`);
  },

  record: async (data: RecordAttendanceRequest): Promise<ApiResponse<{ totalRecorded: number; present: number; absent: number; late: number }>> => {
    return apiFetch('/attendance/record-attend', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getStudentHistory: async (studentId: string, startDate?: string, endDate?: string): Promise<ApiResponse<AttendanceHistory>> => {
    const searchParams = new URLSearchParams();
    if (startDate) searchParams.append('startDate', startDate);
    if (endDate) searchParams.append('endDate', endDate);
    
    const queryString = searchParams.toString();
    return apiFetch<ApiResponse<AttendanceHistory>>(`/attendance/attend/${studentId}${queryString ? `?${queryString}` : ''}`);
  },
};
