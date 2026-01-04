// src/lib/service/email-service.ts
import apiClient from './api-client';
class EmailService {
// Send verification email after registration
    async sendVerificationEmail(email: string, name: string, otp: string) {
        try {
            const response = await apiClient.post('/auth/send-verification', {
                email,
                name,
                otp
            });
            return response.data;
        } catch (error) {
            console.error('Failed to send verification email:', error);
            throw error;
        }
    }
// Send password reset email
    async sendPasswordResetEmail(email: string, name: string, resetCode: string) {
        try {
            const response = await apiClient.post('/auth/send-reset-code', {
                email,
                name,
                resetCode
            });
            return response.data;
        } catch (error) {
            console.error('Failed to send reset email:', error);
            throw error;
        }
    }
// Send course enrollment confirmation
    async sendEnrollmentEmail(userId: string, courseId: string) {
        try {
            const response = await apiClient.post('/notifications/enrollment', {
                userId,
                courseId
            });
            return response.data;
        } catch (error) {
            console.error('Failed to send enrollment email:', error);
            throw error;
        }
    }
// Send certificate email
    async sendCertificateEmail(userId: string, courseId: string, certificateUrl: string) {
        try {
            const response = await apiClient.post('/notifications/certificate', {
                userId,
                courseId,
                certificateUrl
            });
            return response.data;
        } catch (error) {
            console.error('Failed to send certificate email:', error);
            throw error;
        }
    }
}
export const emailService = new EmailService();
