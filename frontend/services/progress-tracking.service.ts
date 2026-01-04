
import apiClient from "./api-client";

export interface ProgressData {
    courseId: string;
    moduleIndex?: number;
    resourceIndex?: number;
    completedResources?: string[];
    currentModule?: number;
    currentResource?: number;
    overallProgress?: number;
}

export interface CourseProgressSummary {
    courseId: string;
    courseName: string;
    progress: number;
    completedModules: number;
    totalModules: number;
    lastAccessed: string;
}

class ProgressTrackingService {
    // Save progress for a course
    async saveProgress(progressData: ProgressData): Promise<void> {
        await apiClient.post('/progress/save', progressData);
    }

    // Update progress (wrapper around saveProgress)
    async updateProgress(courseId: string, moduleIndex: number, resourceIndex: number): Promise<void> {
        await this.saveProgress({
            courseId,
            moduleIndex,
            resourceIndex,
        });
    }

    // Get progress for a specific course
    async getProgress(courseId: string): Promise<ProgressData | null> {
        try {
            const response = await apiClient.get(`/progress/${courseId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching progress:', error);
            return null;
        }
    }

    // Get progress summary for all enrolled courses
    async getProgressSummary(): Promise<CourseProgressSummary[]> {
        try {
            const response = await apiClient.get('/progress');
            return response.data;
        } catch (error) {
            console.error('Error fetching progress summary:', error);
            return [];
        }
    }

    // Mark a resource as completed
    async markResourceCompleted(courseId: string, moduleIndex: number, resourceId: string): Promise<void> {
        await apiClient.post('/progress/save', {
            courseId,
            moduleIndex,
            completedResourceId: resourceId,
        });
    }
}

export const progressTrackingService = new ProgressTrackingService();
