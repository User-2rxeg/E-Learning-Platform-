import {
    Injectable,
    UnauthorizedException,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserService } from '../../user/user.service';
import { UserRole, AccountStatus, User } from '../../database/user';

import { MailService } from '../email/email-service';

import { CreateUserDto } from '../../dto\'s/user-dtos\'s';
import { BlacklistedToken, BlackListedTokenDocument } from "../token/blacklisted-token.schema";
import { AuditLogService } from '../../audit-log/audit-logging.service';
import { Logs } from '../../audit-log/Logs';

// Constants for security
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const OTP_RESEND_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes

type SafeUser = {
    _id: string;
    email: string;
    role: UserRole;
    status: AccountStatus;
    isEmailVerified: boolean;
};

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        @InjectModel(BlacklistedToken.name) private readonly blacklistModel: Model<BlackListedTokenDocument>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly mail: MailService,
        private readonly audit: AuditLogService,
    ) {}

    private toSafeUser(doc: any): SafeUser {
        const obj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
        return {
            _id: String(obj._id),
            email: obj.email,
            role: obj.role,
            status: obj.status || AccountStatus.ACTIVE,
            isEmailVerified: !!obj.isEmailVerified,
        };
    }

    // Get account status for server guard
    async getAccountStatus(userId: string): Promise<AccountStatus> {
        const user = await this.userModel.findById(userId).select('status lockedUntil').lean();
        if (!user) return AccountStatus.TERMINATED;

        // Check if lockout has expired
        if (user.status === AccountStatus.LOCKED && user.lockedUntil) {
            if (new Date() > new Date(user.lockedUntil)) {
                // Auto-unlock
                await this.userModel.findByIdAndUpdate(userId, {
                    status: AccountStatus.ACTIVE,
                    $unset: { lockedUntil: 1 },
                    failedLoginAttempts: 0,
                });
                return AccountStatus.ACTIVE;
            }
        }

        return user.status || AccountStatus.ACTIVE;
    }

    async register(dto: CreateUserDto) {
        const existing = await this.userService.findByEmail(dto.email);
        if (existing) throw new BadRequestException('Email already in use');

        const newUser = await this.userService.create(dto);

        const otpCode = this.generateOTP();
        const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

        await this.userService.updateUserInternal(String(newUser._id), {
            isEmailVerified: false,
            otpCode,
            otpExpiresAt,
            status: AccountStatus.ACTIVE,
        });

        try {
            await this.mail.sendVerificationEmail(newUser.email, otpCode);
        } catch (e: any) {
            console.error('Failed to send verification email:', e?.message ?? String(e));
        }

        await this.audit.log(Logs.REGISTRATION, String(newUser._id), { email: newUser.email });

        return {
            message: 'Registered successfully. Please verify your email via OTP.',
            userId: newUser._id,
        };
    }

    async verifyOTP(email: string, otpCode: string) {
        const user = await this.userModel.findOne({ email: email.toLowerCase() }).select('+otpCode');
        if (!user) throw new NotFoundException('User not found');

        if (!user.otpCode || !user.otpExpiresAt || user.otpCode !== otpCode || new Date() > user.otpExpiresAt) {
            throw new UnauthorizedException('Invalid or expired OTP');
        }

        await this.userModel.findByIdAndUpdate(user._id, {
            isEmailVerified: true,
            $unset: { otpCode: 1, otpExpiresAt: 1 },
        });

        // Send verification confirmation email
        try {
            await this.mail.VerifiedEmail(user.email, 'Your email has been successfully verified. You can now log in to your account.');
        } catch (e) {
            console.error('Failed to send verification confirmation:', e);
        }

        // Send welcome email
        try {
            await this.mail.sendWelcomeEmail(user.email, user.name);
        } catch (e) {
            console.error('Failed to send welcome email:', e);
        }

        await this.audit.log(Logs.EMAIL_VERIFIED, String(user._id), { email: user.email });

        return { message: 'Email verified successfully', user: { id: user._id, email: user.email, role: user.role } };
    }

    async validateUser(email: string, plainPassword: string, ip?: string): Promise<SafeUser> {
        const user = await this.userModel.findOne({ email: email.toLowerCase() }).select('+passwordHash +status +failedLoginAttempts +lockedUntil');

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check account status
        const status = user.status || AccountStatus.ACTIVE;

        if (status === AccountStatus.LOCKED) {
            if (user.lockedUntil && new Date() > user.lockedUntil) {
                // Auto-unlock
                await this.userModel.findByIdAndUpdate(user._id, {
                    status: AccountStatus.ACTIVE,
                    $unset: { lockedUntil: 1 },
                    failedLoginAttempts: 0,
                });
            } else {
                const remainingMinutes = user.lockedUntil
                    ? Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000)
                    : 30;
                throw new ForbiddenException(`Account is locked. Try again in ${remainingMinutes} minutes.`);
            }
        }

        if (status === AccountStatus.SUSPENDED) {
            throw new ForbiddenException('Account is suspended. Please contact support.');
        }

        if (status === AccountStatus.TERMINATED) {
            throw new ForbiddenException('Account has been terminated.');
        }

        if (!user.passwordHash) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(plainPassword, user.passwordHash);

        if (!isPasswordValid) {
            await this.handleFailedLogin(user, ip);
            throw new UnauthorizedException('Invalid credentials');
        }

        // Clear failed attempts on successful login
        await this.userModel.findByIdAndUpdate(user._id, {
            failedLoginAttempts: 0,
            $unset: { lockedUntil: 1 },
            lastLoginAt: new Date(),
            lastLoginIp: ip,
        });

        return this.toSafeUser(user);
    }

    private async handleFailedLogin(user: any, ip?: string): Promise<void> {
        const failedAttempts = (user.failedLoginAttempts || 0) + 1;
        const updateData: any = { failedLoginAttempts: failedAttempts };

        if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
            const lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
            updateData.status = AccountStatus.LOCKED;
            updateData.lockedUntil = lockoutUntil;
            updateData.statusReason = 'Too many failed login attempts';
            updateData.statusChangedAt = new Date();

            await this.audit.log(Logs.ADMIN_USER_LOCK, undefined, {
                userId: String(user._id),
                email: user.email,
                ip,
                reason: 'Too many failed login attempts',
                failedAttempts,
            });

            // Send account locked email
            try {
                await this.mail.sendAccountLockedEmail(
                    user.email,
                    user.name || 'User',
                    'Too many failed login attempts',
                    lockoutUntil
                );
            } catch (e) {
                console.error('Failed to send account locked email:', e);
            }
        }

        await this.userModel.findByIdAndUpdate(user._id, updateData);

        await this.audit.log(Logs.LOGIN_FAILED, undefined, {
            userId: String(user._id),
            email: user.email,
            ip,
            failedAttempts,
            remainingAttempts: Math.max(0, MAX_LOGIN_ATTEMPTS - failedAttempts),
        });
    }

    async login(email: string, plainPassword: string, ip?: string) {
        const user = await this.validateUser(email, plainPassword, ip);

        if (!user.isEmailVerified) {
            throw new UnauthorizedException('Email not verified. Please verify your email first.');
        }

        const payload = { sub: user._id, email: user.email, role: user.role };
        const access_token = await this.jwtService.signAsync(payload, { expiresIn: '7d' });

        await this.audit.log(Logs.LOGIN_SUCCESS, user._id, { email: user.email, ip });

        return { access_token, user };
    }

    async getCookieWithJwtToken(token: string) {
        const isProduction = process.env.NODE_ENV === 'production';
        return `access_token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=${isProduction ? 'Strict' : 'Lax'}${isProduction ? '; Secure' : ''}`;
    }

    async getCookieForLogout() {
        return `access_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
    }

    async logout(token: string, userId?: string) {
        if (!token) throw new BadRequestException('No token provided');

        let decoded: any;
        try {
            decoded = await this.jwtService.verifyAsync(token);
        } catch {
            return { message: 'Logout successful' };
        }

        try {
            await this.blacklistModel.create({
                token,
                expiresAt: new Date(decoded.exp * 1000),
            });
        } catch (err: any) {
            if (err.code !== 11000) throw err;
        }

        await this.audit.log(Logs.LOGOUT, userId || decoded.sub, {});

        return { message: 'Logout successful' };
    }

async isAccessTokenBlacklisted(token: string): Promise<boolean> {
        const count = await this.blacklistModel.countDocuments({ token });
        return count > 0;
    }

    private generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private async sendOtpGeneric(email: string, purpose: 'verification' | 'password-reset', rateLimit: boolean): Promise<void> {
        const user = await this.userModel.findOne({ email: email.toLowerCase() });
        if (!user) throw new NotFoundException('User not found');

        if (purpose === 'verification' && user.isEmailVerified) {
            throw new BadRequestException('Email is already verified');
        }

        const lastExpiry = purpose === 'password-reset'
            ? user.passwordResetOtpExpiresAt
            : user.otpExpiresAt;

        if (rateLimit && lastExpiry && Date.now() - lastExpiry.getTime() < OTP_RESEND_COOLDOWN_MS) {
            throw new BadRequestException('Please wait before requesting a new OTP');
        }

        const otpCode = this.generateOTP();
        const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

        const updateData = purpose === 'password-reset'
            ? { passwordResetOtpCode: otpCode, passwordResetOtpExpiresAt: otpExpiresAt }
            : { otpCode, otpExpiresAt };

        await this.userModel.findByIdAndUpdate(user._id, updateData);

        try {
            if (purpose === 'verification') {
                await this.mail.sendVerificationEmail(user.email, otpCode);
            } else {
                await this.mail.sendPasswordResetEmail(user.email, otpCode);
            }
        } catch (err: any) {
            console.error('Failed to send OTP email:', err?.message ?? String(err));
        }
    }

    async sendOTP(email: string): Promise<{ message: string }> {
        await this.sendOtpGeneric(email, 'verification', false);
        return { message: 'OTP sent to email' };
    }

    async resendOTP(email: string): Promise<{ message: string }> {
        await this.sendOtpGeneric(email, 'verification', true);
        return { message: 'OTP resent successfully' };
    }

    async checkOTPStatus(email: string) {
        const user = await this.userModel.findOne({ email: email.toLowerCase() }).select('otpExpiresAt');
        if (!user) throw new NotFoundException('User not found');
        const now = new Date();
        const valid = !!(user.otpExpiresAt && now < user.otpExpiresAt);
        return { valid, expiresAt: user.otpExpiresAt ?? undefined };
    }

    async forgotPassword(email: string): Promise<{ message: string }> {
        await this.sendOtpGeneric(email, 'password-reset', false);
        await this.audit.log(Logs.PASSWORD_RESET_REQUESTED, undefined, { email });
        return { message: 'Password reset OTP sent to email' };
    }

    async resetPassword(email: string, otpCode: string, newPassword: string) {
        const user = await this.userModel.findOne({ email: email.toLowerCase() }).select('+passwordResetOtpCode +name');
        if (!user) throw new NotFoundException('User not found');

        if (
            !user.passwordResetOtpCode ||
            !user.passwordResetOtpExpiresAt ||
            user.passwordResetOtpCode !== otpCode ||
            new Date() > user.passwordResetOtpExpiresAt
        ) {
            throw new UnauthorizedException('Invalid or expired OTP');
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);

        await this.userModel.findByIdAndUpdate(user._id, {
            passwordHash,
            passwordChangedAt: new Date(),
            $unset: { passwordResetOtpCode: 1, passwordResetOtpExpiresAt: 1 },
        });

        await this.audit.log(Logs.PASSWORD_CHANGED, String(user._id), { email: user.email });

        // Send password changed confirmation email
        try {
            await this.mail.sendPasswordChangedEmail(user.email, user.name || 'User');
        } catch (e) {
            console.error('Failed to send password changed email:', e);
        }

        return { message: 'Password changed successfully' };
    }
}
