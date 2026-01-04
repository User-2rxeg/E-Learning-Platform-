
import apiClient from './api-client';

class CertificateService {
    async generateCertificate(courseId: string) {
        try {
            const response = await apiClient.post('/certificates/generate', {
                courseId
            });
            return response.data;
        } catch (error) {
            console.error('Failed to generate certificate:', error);
            throw error;
        }
    }
    async downloadCertificate(certificateId: string) {
        try {
            const response = await apiClient.get(`/certificates/${certificateId}/download`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `certificate-${certificateId}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download certificate:', error);
            throw error;
        }
    }

    async getMyCertificates() {
        try {
            const response = await apiClient.get('/certificates/my-certificates');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch certificates:', error);
            return [];
        }
    }
}
export const certificateService = new CertificateService();
