import { apiFetch } from './config';
import type { ApiResponse, Lesson, Question, CreateLessonRequest, CreateQuestionRequest } from './types';

export const lessonsApi = {
    // Get all lessons for a subject
    getSubjectLessons: async (subjectId: string, status?: string): Promise<ApiResponse<Lesson[]>> => {
        const queryString = status ? `?status=${status}` : '';
        return apiFetch<ApiResponse<Lesson[]>>(`/subjects/${subjectId}/lessons${queryString}`);
    },

    // Get lesson by ID
    getLessonById: async (lessonId: string, level?: string, language: string = 'ar'): Promise<ApiResponse<Lesson>> => {
        const params = new URLSearchParams();
        if (level) params.append('level', level);
        params.append('language', language);
        const queryString = params.toString();
        return apiFetch<ApiResponse<Lesson>>(`/lessons/${lessonId}${queryString ? `?${queryString}` : ''}`);
    },

    // Get questions for a lesson
    getQuestionsByLesson: async (lessonId: string, level?: string): Promise<ApiResponse<Question[]>> => {
        const queryString = level ? `?level=${level}` : '';
        return apiFetch<ApiResponse<Question[]>>(`/lessons/${lessonId}/questions${queryString}`);
    },

    // Create a new lesson (admin/teacher only)
    createLesson: async (data: CreateLessonRequest): Promise<ApiResponse<Lesson>> => {
        return apiFetch<ApiResponse<Lesson>>('/lessons', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Update a lesson
    updateLesson: async (lessonId: string, data: Partial<CreateLessonRequest>): Promise<ApiResponse<Lesson>> => {
        return apiFetch<ApiResponse<Lesson>>(`/lessons/${lessonId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // Delete a lesson
    deleteLesson: async (lessonId: string): Promise<ApiResponse<null>> => {
        return apiFetch<ApiResponse<null>>(`/lessons/${lessonId}`, {
            method: 'DELETE',
        });
    },

    // Add a question to a lesson
    addQuestion: async (lessonId: string, data: CreateQuestionRequest): Promise<ApiResponse<Question>> => {
        return apiFetch<ApiResponse<Question>>(`/lessons/${lessonId}/questions`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Update a question
    updateQuestion: async (questionId: string, data: Partial<CreateQuestionRequest>): Promise<ApiResponse<Question>> => {
        return apiFetch<ApiResponse<Question>>(`/questions/${questionId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // Delete a question
    deleteQuestion: async (questionId: string): Promise<ApiResponse<null>> => {
        return apiFetch<ApiResponse<null>>(`/questions/${questionId}`, {
            method: 'DELETE',
        });
    }
};
