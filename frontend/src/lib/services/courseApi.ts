// src/lib/services/courseApi.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3333';

// Create axios instance with default config
const courseApiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests automatically
courseApiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const courseService = {
    // Get courses with pagination
    getCourses: async (page = 1, limit = 10) => {
        const response = await courseApiClient.get(`/courses?page=${page}&limit=${limit}`);
        return response.data;
    },

    // Search courses
    searchCourses: async (params: {
        title?: string,
        instructorName?: string,
        tag?: string,
        page?: number,
        limit?: number
    }) => {
        const response = await courseApiClient.get('/courses/search', { params });
        return response.data;
    },

    // Get course by ID
    getCourse: async (id: string) => {
        const response = await courseApiClient.get(`/courses/${id}`);
        return response.data;
    },

    // Create a new course
    createCourse: async (courseData: {
        title: string;
        description: string;
        tags: string[];
        difficulty: 'beginner' | 'intermediate' | 'advanced';
        status: 'draft' | 'published';
    }) => {
        const response = await courseApiClient.post('/courses', courseData);
        return response.data;
    },

    // Update a course
    updateCourse: async (id: string, courseData: any) => {
        const response = await courseApiClient.patch(`/courses/${id}`, courseData);
        return response.data;
    },

    // Enroll in a course
    enrollCourse: async (id: string) => {
        const response = await courseApiClient.patch(`/courses/${id}/enroll`);
        return response.data;
    },

    // Get enrolled courses (for students)
    getEnrolledCourses: async () => {
        const response = await courseApiClient.get('/courses/enrolled');
        return response.data;
    },

    // Get instructor's courses
    getInstructorCourses: async () => {
        const response = await courseApiClient.get('/courses/instructor');
        return response.data;
    },

    // Add a module to a course
    addModule: async (courseId: string, moduleData: {
        title: string;
        description?: string;
        order: number;
    }) => {
        const response = await courseApiClient.post(`/courses/${courseId}/modules`, moduleData);
        return response.data;
    },

    // Add resource to a module
    addLinkResource: async (courseId: string, moduleIndex: number, url: string) => {
        const response = await courseApiClient.post(
            `/courses/${courseId}/modules/${moduleIndex}/resources/link`,
            { url }
        );
        return response.data;
    },

    // Upload file resource
    uploadResource: async (courseId: string, moduleIndex: number, file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await courseApiClient.post(
            `/courses/${courseId}/modules/${moduleIndex}/resources/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return response.data;
    },

    // List resources in a module
    listResources: async (courseId: string, moduleIndex: number) => {
        const response = await courseApiClient.get(
            `/courses/${courseId}/modules/${moduleIndex}/resources`
        );
        return response.data;
    },

    // Delete a resource from a module
    deleteResource: async (courseId: string, moduleIndex: number, resourceId: string) => {
        const response = await courseApiClient.delete(
            `/courses/${courseId}/modules/${moduleIndex}/resources/${resourceId}`
        );
        return response.data;
    },

    // Get instructor dashboard analytics
    getInstructorAnalytics: async () => {
        const response = await courseApiClient.get('/analytics/instructor/dashboard');
        return response.data;
    },

    // Delete a course
    deleteCourse: async (id: string) => {
        const response = await courseApiClient.delete(`/courses/${id}`);
        return response.data;
    }
};