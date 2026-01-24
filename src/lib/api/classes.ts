import { apiFetch } from './config';
import type {
    ApiResponse,
    Class,
    UpdateClassTeacherRequest
} from './types';

interface GetClassesParams {
    grade?: string;
    academicYear?: string;
    status?: string;
}

export const classesApi = {
    getAll: async (params: GetClassesParams = {}): Promise<ApiResponse<Class[]>> => {
        const searchParams = new URLSearchParams();
        if (params.grade) searchParams.append('grade', params.grade);
        if (params.academicYear) searchParams.append('academicYear', params.academicYear);
        if (params.status) searchParams.append('status', params.status);

        const queryString = searchParams.toString();
        return apiFetch<ApiResponse<Class[]>>(`/classes${queryString ? `?${queryString}` : ''}`);
    },

    getById: async (id: string): Promise<ApiResponse<Class>> => {
        return apiFetch<ApiResponse<Class>>(`/classes/${id}`);
    },

    update: async (id: string, data: Partial<Class>): Promise<ApiResponse<Class>> => {
        return apiFetch(`/classes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    assignClassTeacher: async (classId: string, teacherId: string): Promise<ApiResponse<Class>> => {
        return apiFetch(`/classes/${classId}/class-teacher`, {
            method: 'PUT',
            body: JSON.stringify({ classTeacherId: teacherId }),
        });
    },

    removeClassTeacher: async (classId: string): Promise<ApiResponse<null>> => {
        return apiFetch(`/classes/${classId}/class-teacher`, {
            method: 'DELETE',
        });
    },
};
