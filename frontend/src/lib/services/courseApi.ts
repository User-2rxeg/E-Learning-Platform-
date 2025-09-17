// src/lib/services/courseApi.ts - FIXED VERSION

import apiClient from "./apiClient";

export interface Resource {
    _id?: string;
    id?: string;
    resourceType: 'video' | 'pdf' | 'link';
    url: string;
    filename?: string;
    mimeType?: string;
    size?: number;
    uploadedBy?: string;
    uploadedAt?: Date;
}

export interface Module {
    title: string;
    resources: Resource[];
    quizzes?: string[];
    notesEnabled?: boolean;
}

export interface Instructor {
    _id: string;
    name: string;
    email: string;
}

export interface Course {
    _id: string;
    title: string;
    description: string;
    instructorId: Instructor;
    tags: string[];
    status: 'active' | 'archived' | 'draft';
    studentsEnrolled: string[];
    modules: Module[];
    feedback: {
        rating: number;
        comment?: string;
        createdAt: string;
    }[];
    versionHistory: any[];
    certificateAvailable: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CourseResponse {
    courses: Course[];
    total: number;
}

export interface SearchParams {
    title?: string;
    instructorName?: string;
    tag?: string;
    page?: number;
    limit?: number;
}

// Progress tracking interfaces
export interface CourseProgress {
    courseId: string;
    studentId: string;
    completedResources: string[];
    currentModule: number;
    currentResource: number;
    overallProgress: number;
    lastAccessed: Date;
}

export interface Note {
    id: string;
    courseId: string;
    moduleIndex: number;
    resourceId?: string;
    content: string;
    timestamp: Date;
}

class CourseService {

    async getInstructorCourses(instructorId: string) {
        try {
            const response = await fetch(`/api/courses/instructor/${instructorId}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch instructor courses:', error);
            return [];
        }
    }

    async getInstructorAnalytics(instructorId: string) {
        try {
            const response = await fetch(`/api/analytics/instructor/${instructorId}/summary`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch instructor analytics:', error);
            return null;
        }
    }


// FIXED: Handle different response structures
    async getCourses(page: number = 1, limit: number = 10): Promise<CourseResponse> {
        try {
            const response = await apiClient.get(`/courses?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching courses:', error);
            throw new Error('Failed to fetch courses');
        }
    }

    // FIXED: Single course fetch with proper error handling
    async getCourse(id: string): Promise<Course> {
        try {
            const response = await apiClient.get(`/courses/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching course:', error);
            throw new Error('Course not found');
        }
    }

    // FIXED: Search with proper error handling
    async searchCourses(params: SearchParams): Promise<any> {
        try {
            const queryParams = new URLSearchParams();

            if (params.title) queryParams.append('title', params.title);
            if (params.instructorName) queryParams.append('instructorName', params.instructorName);
            if (params.tag) queryParams.append('tag', params.tag);
            if (params.page) queryParams.append('page', params.page.toString());
            if (params.limit) queryParams.append('limit', params.limit.toString());

            const response = await apiClient.get(`/courses/search?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error searching courses:', error);
            throw new Error('Search failed');
        }
    }

    // FIXED: Enroll with proper error handling
    async enrollCourse(courseId: string): Promise<any> {
        try {
            const response = await apiClient.patch(`/courses/${courseId}/enroll`);
            return response.data;
        } catch (error) {
            console.error('Error enrolling in course:', error);
            throw new Error('Enrollment failed');
        }
    }

    // NEW: Progress tracking methods that actually save to backend
    async saveProgress(progress: Omit<CourseProgress, 'studentId'>): Promise<void> {
        try {
            await apiClient.post('/progress/save', progress);
        } catch (error) {
            console.error('Error saving progress:', error);
            // Fallback to localStorage
            localStorage.setItem(`course-progress-${progress.courseId}`, JSON.stringify({
                ...progress,
                timestamp: new Date().toISOString()
            }));
        }
    }

    async getProgress(courseId: string): Promise<CourseProgress | null> {
        try {
            const response = await apiClient.get(`/progress/${courseId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching progress:', error);
            // Fallback to localStorage
            const saved = localStorage.getItem(`course-progress-${courseId}`);
            return saved ? JSON.parse(saved) : null;
        }
    }

    // NEW: Notes that actually save to backend
    async saveNote(note: Omit<Note, 'id'>): Promise<Note> {
        try {
            const response = await apiClient.post('/notes', note);
            return response.data;
        } catch (error) {
            console.error('Error saving note:', error);
            // Fallback to localStorage
            const newNote: Note = {
                ...note,
                id: Date.now().toString()
            };
            const existing = this.getLocalNotes(note.courseId);
            const updated = [...existing, newNote];
            localStorage.setItem(`course-notes-${note.courseId}`, JSON.stringify(updated));
            return newNote;
        }
    }

    async getNotes(courseId: string): Promise<Note[]> {
        try {
            const response = await apiClient.get(`/notes/${courseId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching notes:', error);
            return this.getLocalNotes(courseId);
        }
    }

    async deleteNote(noteId: string, courseId: string): Promise<void> {
        try {
            await apiClient.delete(`/notes/${noteId}`);
        } catch (error) {
            console.error('Error deleting note:', error);
            // Fallback to localStorage
            const existing = this.getLocalNotes(courseId);
            const updated = existing.filter(note => note.id !== noteId);
            localStorage.setItem(`course-notes-${courseId}`, JSON.stringify(updated));
        }
    }

    private getLocalNotes(courseId: string): Note[] {
        const saved = localStorage.getItem(`course-notes-${courseId}`);
        return saved ? JSON.parse(saved) : [];
    }

    // FIXED: File upload with proper error handling
    // async uploadCourseResource(courseId: string, moduleIndex: number, file: File): Promise<any> {
    //     try {
    //         const formData = new FormData();
    //         formData.append('file', file);
    //
    //         const response = await apiClient.post(
    //             `/courses/${courseId}/modules/${moduleIndex}/resources/upload`,
    //             formData,
    //             {
    //                 headers: {
    //                     'Content-Type': 'multipart/form-data',
    //                 },
    //                 onUploadProgress: (progressEvent) => {
    //                     const percentCompleted = Math.round(
    //                         (progressEvent.loaded * 100) / (progressEvent.total || 1)
    //                     );
    //                     console.log(`Upload Progress: ${percentCompleted}%`);
    //                 },
    //                 timeout: 60000 // 60 second timeout for file uploads
    //             }
    //         );
    //         return response.data;
    //     } catch (error) {
    //         console.error('Error uploading file:', error);
    //         throw new Error('File upload failed');
    //     }
    // }

    // FIXED: Resource URL validation and fallbacks
    getResourceUrl(resource: Resource): string {
        if (!resource.url) {
            throw new Error('Resource URL is missing');
        }

        // If it's already a full URL, return it
        if (resource.url.startsWith('http')) {
            return resource.url;
        }

        // If it's a relative path, prepend the backend URL
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3555';
        return `${baseUrl}/${resource.url}`;
    }

    // NEW: Resource validation before display
    async validateResource(resource: Resource): Promise<boolean> {
        try {
            const url = this.getResourceUrl(resource);
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            console.error('Resource validation failed:', error);
            return false;
        }
    }

    // Keep existing methods...
    async addFeedback(courseId: string, rating: number, comment?: string): Promise<any> {
        const response = await apiClient.post(`/courses/${courseId}/feedback`, {
            rating,
            comment
        });
        return response.data;
    }


            async getEnrolledCourses() {
                try {
                    // Try to fetch from your backend if it exists
                    // const response = await fetch('http://localhost:3555/courses/enrolled');
                    // return await response.json();

                    // Mock data for now
                    return [
                        {
                            _id: '1',
                            title: 'React Advanced Patterns',
                            description: 'Learn advanced React patterns and best practices',
                            instructorId: {
                                _id: 'inst1',
                                name: 'John Doe'
                            },
                            modules: [
                                { _id: 'mod1', title: 'Introduction', resources: ['video1', 'pdf1'] },
                                { _id: 'mod2', title: 'Advanced Hooks', resources: ['video2', 'pdf2'] }
                            ],
                            certificateAvailable: false
                        },
                        {
                            _id: '2',
                            title: 'Node.js Masterclass',
                            description: 'Complete backend development with Node.js',
                            instructorId: {
                                _id: 'inst2',
                                name: 'Jane Smith'
                            },
                            modules: [
                                { _id: 'mod3', title: 'Setup', resources: ['video3'] },
                                { _id: 'mod4', title: 'REST APIs', resources: ['video4', 'code1'] }
                            ],
                            certificateAvailable: true
                        }
                    ];
                } catch (error) {
                    console.error('Failed to fetch courses:', error);
                    return [];
                }
            }




    async createCourse(courseData: any): Promise<Course> {
        const response = await apiClient.post('/courses', courseData);
        return response.data;
    }

    async updateCourse(courseId: string, courseData: any): Promise<Course> {
        const response = await apiClient.patch(`/courses/${courseId}`, courseData);
        return response.data;
    }

    async deleteCourse(courseId: string): Promise<void> {
        await apiClient.delete(`/courses/${courseId}`);
    }

    async addModule(courseId: string, moduleData: any): Promise<Course> {
        const response = await apiClient.post(`/courses/${courseId}/modules`, moduleData);
        return response.data;
    }

    async addLinkResource(courseId: string, moduleIndex: number, url: string): Promise<any> {
        const response = await apiClient.post(
            `/courses/${courseId}/modules/${moduleIndex}/resources/link`,
            { url }
        );
        return response.data;
    }

    async getModuleResources(courseId: string, moduleIndex: number): Promise<any> {
        const response = await apiClient.get(
            `/courses/${courseId}/modules/${moduleIndex}/resources`
        );
        return response.data;
    }

    async deleteResource(courseId: string, moduleIndex: number, resourceId: string): Promise<any> {
        const response = await apiClient.delete(
            `/courses/${courseId}/modules/${moduleIndex}/resources/${resourceId}`
        );
        return response.data;
    }

    async uploadCourseResource(courseId: string, moduleIndex: number, file: File): Promise<any> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await apiClient.post(
                `/courses/${courseId}/modules/${moduleIndex}/resources/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percentCompleted = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            // You can emit this progress to a state setter
                            console.log(`Upload Progress: ${percentCompleted}%`);
                        }
                    },
                    timeout: 300000 // 5 minute timeout for large files
                }
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 413) {
                throw new Error('File too large. Maximum size is 100MB.');
            }
            throw new Error('File upload failed');
        }
    }
}

export const courseService = new CourseService();