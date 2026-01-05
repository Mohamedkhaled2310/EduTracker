import { apiFetch } from './config';
import type { ApiResponse, DashboardStats, AttendanceChartData, PerformanceChartData, CreateClassRequest } from './types';

export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    return apiFetch<ApiResponse<DashboardStats>>('/dashboard/stats');
  },

  getAttendanceChart: async (period: 'week' | 'month' | 'semester' = 'week'): Promise<ApiResponse<AttendanceChartData[]>> => {
    return apiFetch<ApiResponse<AttendanceChartData[]>>(`/dashboard/attendance-chart?period=${period}`);
  },

  getPerformanceChart: async (period: 'week' | 'month' | 'semester' = 'week'): Promise<ApiResponse<PerformanceChartData[]>> => {
    return apiFetch<ApiResponse<PerformanceChartData[]>>(`/dashboard/performance-chart?period=${period}`);
  },

  createClass: async (data: CreateClassRequest): Promise<ApiResponse<{ class: { id: number; grade: string; section: string; name: string; academicYear: string } }>> => {
    return apiFetch('/dashboard/create-class', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
