import { apiFetch } from './config';
import type {
    ApiResponse,
    StudentProgress,
    StudentAnswer,
    SubmitAnswerRequest,
    SubmitAnswerResponse,
    StudentStats,
    LessonProgressResponse
} from './types';

export const progressApi = {
    // Update video watch progress
    updateVideoProgress: async (
        lessonId: string,
        videoProgress: number,
        videoWatched: boolean
    ): Promise<ApiResponse<StudentProgress>> => {
        return apiFetch<ApiResponse<StudentProgress>>('/progress/video', {
            method: 'POST',
            body: JSON.stringify({
                lessonId,
                videoProgress,
                videoWatched
            }),
        });
    },

    // Submit an answer to a question
    submitAnswer: async (data: SubmitAnswerRequest): Promise<SubmitAnswerResponse> => {
        return apiFetch<SubmitAnswerResponse>('/progress/answer', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Get student's overall progress
    getStudentProgress: async (studentId: string): Promise<ApiResponse<StudentProgress[]>> => {
        return apiFetch<ApiResponse<StudentProgress[]>>(`/progress/student/${studentId}`);
    },

    // Get progress for a specific lesson
    getLessonProgress: async (lessonId: string): Promise<ApiResponse<LessonProgressResponse>> => {
        return apiFetch<ApiResponse<LessonProgressResponse>>(`/progress/lesson/${lessonId}`);
    },

    // Mark lesson as completed
    completeLesson: async (lessonId: string, selectedLevel: string): Promise<ApiResponse<{
        score: number;
        questionsCorrect: number;
        questionsAttempted: number;
    }>> => {
        return apiFetch('/progress/complete', {
            method: 'POST',
            body: JSON.stringify({
                lessonId,
                selectedLevel
            }),
        });
    },

    // Get student statistics
    getStudentStats: async (studentId: string): Promise<ApiResponse<StudentStats>> => {
        return apiFetch<ApiResponse<StudentStats>>(`/progress/stats/${studentId}`);
    }
};
