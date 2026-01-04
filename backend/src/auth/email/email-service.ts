import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

// Email template types
export enum EmailTemplate {
    VERIFICATION = 'verification',
    PASSWORD_RESET = 'password_reset',
    EMAIL_VERIFIED = 'email_verified',
    ENROLLMENT_CONFIRMATION = 'enrollment_confirmation',
    COURSE_UPDATE = 'course_update',
    QUIZ_RESULT = 'quiz_result',
    ACCOUNT_LOCKED = 'account_locked',
    ACCOUNT_UNLOCKED = 'account_unlocked',
    ACCOUNT_SUSPENDED = 'account_suspended',
    PASSWORD_CHANGED = 'password_changed',
    WELCOME = 'welcome',
    ANNOUNCEMENT = 'announcement',
    NEW_MESSAGE = 'new_message',
    COURSE_COMPLETED = 'course_completed',
}

@Injectable()
export class MailService {
    private transporter;
    private readonly platformName = 'E-Learning Platform';
    private readonly supportEmail = process.env.SUPPORT_EMAIL || 'support@elearning.com';
    private readonly primaryColor = '#8B5CF6';
    private readonly secondaryColor = '#6366F1';

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT || 587),
            secure: (process.env.SMTP_SECURE === 'true') || false,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_APP_PASSWORD },
        });

        this.transporter.verify()
            .then(() => console.log('✉️ Mail transporter connected'))
            .catch(err => console.error('❌ Mail transporter error:', err.message));
    }

    // Base email template wrapper
    private wrapInTemplate(content: string, title: string): string {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, ${this.primaryColor} 0%, ${this.secondaryColor} 100%); padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">📚 ${this.platformName}</h1>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            ${content}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                                © ${new Date().getFullYear()} ${this.platformName}. All rights reserved.
                            </p>
                            <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                                This is an automated message. Please do not reply directly to this email.<br>
                                Need help? Contact us at <a href="mailto:${this.supportEmail}" style="color: ${this.primaryColor};">${this.supportEmail}</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    }

    // OTP code display component
    private otpComponent(otp: string, expiryMinutes: number = 10): string {
        return `
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; text-align: center; margin: 25px 0; border-radius: 12px; border: 2px dashed ${this.primaryColor};">
                <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                <h1 style="font-size: 42px; color: ${this.primaryColor}; margin: 0; letter-spacing: 8px; font-weight: 700;">${otp}</h1>
                <p style="color: #94a3b8; font-size: 12px; margin: 15px 0 0 0;">⏱️ Expires in ${expiryMinutes} minutes</p>
            </div>`;
    }

    // Button component
    private buttonComponent(text: string, url: string): string {
        return `
            <div style="text-align: center; margin: 30px 0;">
                <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, ${this.primaryColor} 0%, ${this.secondaryColor} 100%); color: #ffffff; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);">${text}</a>
            </div>`;
    }

    // Success icon component
    private successIcon(): string {
        return `<div style="text-align: center; margin-bottom: 20px;"><span style="font-size: 60px;">✅</span></div>`;
    }

    // Warning icon component
    private warningIcon(): string {
        return `<div style="text-align: center; margin-bottom: 20px;"><span style="font-size: 60px;">⚠️</span></div>`;
    }

    // Info box component
    private infoBox(content: string, type: 'info' | 'warning' | 'success' = 'info'): string {
        const colors = {
            info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
            warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
            success: { bg: '#ecfdf5', border: '#10b981', text: '#065f46' },
        };
        const c = colors[type];
        return `
            <div style="background-color: ${c.bg}; border-left: 4px solid ${c.border}; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <p style="color: ${c.text}; margin: 0; font-size: 14px;">${content}</p>
            </div>`;
    }

    // ==================== Email Methods ====================

    async sendVerificationEmail(email: string, otp: string): Promise<void> {
        const content = `
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Verify Your Email Address</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                Hello! 👋
            </p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                Thank you for joining <strong>${this.platformName}</strong>! To complete your registration and start your learning journey, please verify your email address using the code below:
            </p>
            ${this.otpComponent(otp)}
            ${this.infoBox('🔒 For your security, never share this code with anyone. Our team will never ask for your verification code.', 'warning')}
            <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
                If you didn't create an account with us, you can safely ignore this email.
            </p>
        `;

        await this.sendMail(email, '🔐 Verify Your Email - ' + this.platformName, this.wrapInTemplate(content, 'Email Verification'));
    }

    async sendPasswordResetEmail(email: string, otp: string): Promise<void> {
        const content = `
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Reset Your Password</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                We received a request to reset your password. Use the code below to proceed:
            </p>
            ${this.otpComponent(otp)}
            ${this.infoBox('⚠️ If you didn\'t request a password reset, please ignore this email and ensure your account is secure.', 'warning')}
            <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
                For security reasons, this code will expire in 10 minutes.
            </p>
        `;

        await this.sendMail(email, '🔑 Password Reset Request - ' + this.platformName, this.wrapInTemplate(content, 'Password Reset'));
    }

    async VerifiedEmail(email: string, message: string): Promise<void> {
        const content = `
            ${this.successIcon()}
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; text-align: center;">Email Verified Successfully!</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0; text-align: center;">
                ${message}
            </p>
            ${this.infoBox('🎉 Your account is now fully activated. You can now access all features of the platform!', 'success')}
            ${this.buttonComponent('Start Learning', process.env.FRONTEND_URL || 'http://localhost:3000')}
        `;

        await this.sendMail(email, '✅ Email Verified - ' + this.platformName, this.wrapInTemplate(content, 'Email Verified'));
    }

    async sendEnrollmentConfirmation(email: string, userName: string, courseTitle: string, instructorName: string): Promise<void> {
        const content = `
            ${this.successIcon()}
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Enrollment Confirmed! 🎓</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                Hi <strong>${userName}</strong>,
            </p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Great news! You've been successfully enrolled in:
            </p>
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 12px; margin: 20px 0;">
                <h3 style="color: ${this.primaryColor}; margin: 0 0 10px 0; font-size: 20px;">📖 ${courseTitle}</h3>
                <p style="color: #64748b; margin: 0; font-size: 14px;">Instructor: ${instructorName}</p>
            </div>
            ${this.infoBox('💡 Tip: Check out the course modules and create a study schedule to stay on track!', 'info')}
            ${this.buttonComponent('Go to Course', process.env.FRONTEND_URL || 'http://localhost:3000')}
        `;

        await this.sendMail(email, '🎉 Enrollment Confirmed - ' + courseTitle, this.wrapInTemplate(content, 'Enrollment Confirmation'));
    }

    async sendCourseUpdateNotification(email: string, userName: string, courseTitle: string, updateMessage: string): Promise<void> {
        const content = `
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">📢 Course Update</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                Hi <strong>${userName}</strong>,
            </p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                There's an update for your enrolled course:
            </p>
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; border-left: 4px solid ${this.primaryColor}; margin: 20px 0;">
                <h3 style="color: ${this.primaryColor}; margin: 0 0 10px 0; font-size: 18px;">${courseTitle}</h3>
                <p style="color: #4b5563; margin: 0; font-size: 14px; line-height: 1.6;">${updateMessage}</p>
            </div>
            ${this.buttonComponent('View Course', process.env.FRONTEND_URL || 'http://localhost:3000')}
        `;

        await this.sendMail(email, '📢 Course Update - ' + courseTitle, this.wrapInTemplate(content, 'Course Update'));
    }

    async sendQuizResultEmail(email: string, userName: string, quizTitle: string, score: number, totalQuestions: number, passed: boolean): Promise<void> {
        const percentage = Math.round((score / totalQuestions) * 100);
        const icon = passed ? '🏆' : '📝';
        const resultText = passed ? 'Congratulations! You Passed!' : 'Keep Practicing!';
        const resultColor = passed ? '#10b981' : '#f59e0b';

        const content = `
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">${icon} Quiz Results</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi <strong>${userName}</strong>, here are your results for:
            </p>
            <div style="background-color: #f9fafb; padding: 25px; border-radius: 12px; text-align: center; margin: 20px 0;">
                <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px;">${quizTitle}</h3>
                <div style="font-size: 48px; color: ${resultColor}; font-weight: 700; margin: 0 0 10px 0;">${percentage}%</div>
                <p style="color: #64748b; margin: 0 0 15px 0; font-size: 14px;">${score} out of ${totalQuestions} correct</p>
                <p style="color: ${resultColor}; font-weight: 600; font-size: 16px; margin: 0;">${resultText}</p>
            </div>
            ${passed 
                ? this.infoBox('🎉 Great job! You\'ve mastered this topic. Keep up the excellent work!', 'success')
                : this.infoBox('💪 Don\'t give up! Review the material and try again. Practice makes perfect!', 'info')
            }
        `;

        await this.sendMail(email, `${icon} Quiz Result: ${percentage}% - ${quizTitle}`, this.wrapInTemplate(content, 'Quiz Results'));
    }

    async sendAccountLockedEmail(email: string, userName: string, reason: string, unlockTime: Date): Promise<void> {
        const content = `
            ${this.warningIcon()}
            <h2 style="color: #dc2626; margin: 0 0 20px 0; font-size: 24px; text-align: center;">Account Temporarily Locked</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                Hi <strong>${userName}</strong>,
            </p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Your account has been temporarily locked for security reasons.
            </p>
            ${this.infoBox(`<strong>Reason:</strong> ${reason}`, 'warning')}
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
                <p style="color: #991b1b; margin: 0; font-size: 14px;">Your account will be automatically unlocked at:</p>
                <p style="color: #dc2626; margin: 10px 0 0 0; font-size: 18px; font-weight: 600;">${unlockTime.toLocaleString()}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
                If you believe this was a mistake, please contact our support team at <a href="mailto:${this.supportEmail}" style="color: ${this.primaryColor};">${this.supportEmail}</a>
            </p>
        `;

        await this.sendMail(email, '🔒 Account Locked - ' + this.platformName, this.wrapInTemplate(content, 'Account Locked'));
    }

    async sendAccountUnlockedEmail(email: string, userName: string): Promise<void> {
        const content = `
            ${this.successIcon()}
            <h2 style="color: #059669; margin: 0 0 20px 0; font-size: 24px; text-align: center;">Account Unlocked!</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                Hi <strong>${userName}</strong>,
            </p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Good news! Your account has been unlocked and you can now sign in again.
            </p>
            ${this.infoBox('🔐 For your security, we recommend changing your password after logging in.', 'info')}
            ${this.buttonComponent('Sign In', process.env.FRONTEND_URL || 'http://localhost:3000/login')}
        `;

        await this.sendMail(email, '🔓 Account Unlocked - ' + this.platformName, this.wrapInTemplate(content, 'Account Unlocked'));
    }

    async sendPasswordChangedEmail(email: string, userName: string): Promise<void> {
        const content = `
            ${this.successIcon()}
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Password Changed Successfully</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                Hi <strong>${userName}</strong>,
            </p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Your password has been successfully changed. You can now use your new password to sign in.
            </p>
            ${this.infoBox('⚠️ If you didn\'t make this change, please contact our support team immediately and secure your account.', 'warning')}
            <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
                Changed on: ${new Date().toLocaleString()}
            </p>
        `;

        await this.sendMail(email, '🔑 Password Changed - ' + this.platformName, this.wrapInTemplate(content, 'Password Changed'));
    }

    async sendCourseCompletedEmail(email: string, userName: string, courseTitle: string, completionDate: Date, certificateAvailable: boolean): Promise<void> {
        const content = `
            <div style="text-align: center; margin-bottom: 20px;"><span style="font-size: 60px;">🎓</span></div>
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; text-align: center;">Congratulations! You've Completed the Course!</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; text-align: center;">
                Hi <strong>${userName}</strong>, you've successfully completed:
            </p>
            <div style="background: linear-gradient(135deg, ${this.primaryColor} 0%, ${this.secondaryColor} 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0;">
                <h3 style="color: #ffffff; margin: 0 0 10px 0; font-size: 22px;">🏆 ${courseTitle}</h3>
                <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">Completed on ${completionDate.toLocaleDateString()}</p>
            </div>
            ${certificateAvailable 
                ? this.infoBox('📜 Your certificate of completion is now available! Download it from your profile.', 'success')
                : ''
            }
            ${this.buttonComponent('View Your Achievements', process.env.FRONTEND_URL || 'http://localhost:3000/profile')}
        `;

        await this.sendMail(email, '🎓 Course Completed - ' + courseTitle, this.wrapInTemplate(content, 'Course Completed'));
    }

    async sendAnnouncementEmail(email: string, userName: string, title: string, message: string, senderName: string): Promise<void> {
        const content = `
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">📢 ${title}</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                Hi <strong>${userName}</strong>,
            </p>
            <div style="background-color: #f9fafb; padding: 25px; border-radius: 12px; margin: 20px 0; border-left: 4px solid ${this.primaryColor};">
                <p style="color: #4b5563; font-size: 15px; line-height: 1.8; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
                — ${senderName}
            </p>
        `;

        await this.sendMail(email, '📢 ' + title + ' - ' + this.platformName, this.wrapInTemplate(content, 'Announcement'));
    }

    async sendNewMessageNotification(email: string, userName: string, senderName: string, messagePreview: string): Promise<void> {
        const content = `
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">💬 New Message</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                Hi <strong>${userName}</strong>,
            </p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                You have a new message from <strong>${senderName}</strong>:
            </p>
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0;">
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0; font-style: italic;">"${messagePreview.substring(0, 200)}${messagePreview.length > 200 ? '...' : ''}"</p>
            </div>
            ${this.buttonComponent('Reply Now', process.env.FRONTEND_URL || 'http://localhost:3000/messages')}
        `;

        await this.sendMail(email, '💬 New Message from ' + senderName, this.wrapInTemplate(content, 'New Message'));
    }

    async sendWelcomeEmail(email: string, userName: string): Promise<void> {
        const content = `
            <div style="text-align: center; margin-bottom: 20px;"><span style="font-size: 60px;">🎉</span></div>
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; text-align: center;">Welcome to ${this.platformName}!</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0; text-align: center;">
                Hi <strong>${userName}</strong>,
            </p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; text-align: center;">
                We're thrilled to have you join our learning community! Here's what you can do:
            </p>
            <div style="margin: 30px 0;">
                <div style="display: flex; margin-bottom: 15px;">
                    <span style="font-size: 24px; margin-right: 15px;">📚</span>
                    <div>
                        <strong style="color: #1f2937;">Browse Courses</strong>
                        <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Explore our library of courses across various topics</p>
                    </div>
                </div>
                <div style="display: flex; margin-bottom: 15px;">
                    <span style="font-size: 24px; margin-right: 15px;">🎯</span>
                    <div>
                        <strong style="color: #1f2937;">Track Progress</strong>
                        <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Monitor your learning journey with detailed analytics</p>
                    </div>
                </div>
                <div style="display: flex; margin-bottom: 15px;">
                    <span style="font-size: 24px; margin-right: 15px;">💬</span>
                    <div>
                        <strong style="color: #1f2937;">Connect & Discuss</strong>
                        <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Join forums and chat with fellow learners</p>
                    </div>
                </div>
            </div>
            ${this.buttonComponent('Start Learning', process.env.FRONTEND_URL || 'http://localhost:3000')}
        `;

        await this.sendMail(email, '🎉 Welcome to ' + this.platformName + '!', this.wrapInTemplate(content, 'Welcome'));
    }

    // Base send mail method
    private async sendMail(to: string, subject: string, html: string): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: `"${this.platformName}" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html,
            });
            console.log(`✉️ Email sent to ${to}: ${subject}`);
        } catch (error: any) {
            console.error(`❌ Failed to send email to ${to}:`, error.message);
            // Don't throw - email failures shouldn't break the application flow
        }
    }
}