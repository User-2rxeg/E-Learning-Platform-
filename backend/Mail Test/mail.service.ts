import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
    private transporter!: nodemailer.Transporter;

    constructor(private configService: ConfigService) {}

    async onModuleInit() {
        // Create Ethereal test account for development
        if (this.configService.get('NODE_ENV') === 'development') {
            const testAccount = await nodemailer.createTestAccount();

            this.transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });

            console.log('Ethereal Email credentials:', {
                user: testAccount.user,
                pass: testAccount.pass,
                preview: 'https://ethereal.email'
            });
        } else {
            // Production configuration (keep your existing setup)
            this.transporter = nodemailer.createTransport({
                host: this.configService.get('SMTP_HOST'),
                port: this.configService.get('SMTP_PORT'),
                secure: this.configService.get('SMTP_SECURE') === 'true',
                auth: {
                    user: this.configService.get('SMTP_USER'),
                    pass: this.configService.get('SMTP_PASS'),
                },
            });
        }
    }

    async sendPasswordResetEmail(email: string, token: string) {
        const resetUrl = `${this.configService.get('PUBLIC_BASE_URL')}/reset-password?token=${token}`;

        const info = await this.transporter.sendMail({
            from: `"${this.configService.get('EMAIL_FROM_NAME')}" <${this.configService.get('SMTP_USER')}>`,
            to: email,
            subject: 'Password Reset Request',
            html: `<p>Please click <a href="${resetUrl}">here</a> to reset your password.</p>`,
        });

        // Log preview URL in development
        if (this.configService.get('NODE_ENV') === 'development') {
            console.log('Email preview URL:', nodemailer.getTestMessageUrl(info));
        }

        return info;
    }

    async testConnection() {
        try {
            await this.transporter.verify();
            return { success: true, message: 'Mail server connection successful' };
        } catch (error) {
            return { success: false, error: error };
        }
    }
}