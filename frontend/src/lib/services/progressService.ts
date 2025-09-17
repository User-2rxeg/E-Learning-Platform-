// src/lib/services/progressService.ts
import apiClient from "./apiC";

class ProgressService {
    async updateProgress(courseId: string, moduleIndex: number, resourceIndex: number) {
        return apiClient.post('/progress/update', {
            courseId,
            moduleIndex,
            resourceIndex,
            completedAt: new Date()
        });
    }

    async getProgress(courseId: string) {
        return apiClient.get(`/progress/${courseId}`);
    }
}