// src/lib/service/progress-tracking.service.ts
import apiClient from "./api-client";

class ProgressTrackingService {
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