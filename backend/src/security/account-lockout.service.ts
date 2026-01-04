import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../database/user';
import { AuditLogService } from '../audit-log/audit-logging.service';
import { Logs } from '../audit-log/Logs';

// In-memory store for failed login attempts (use Redis in production)
interface LoginAttemptEntry {
    attempts: number;
    firstAttempt: number;
    lockedUntil?: number;
}

const loginAttemptStore = new Map<string, LoginAttemptEntry>();

@Injectable()
export class AccountLockoutService {
    private readonly maxAttempts = 5;           // Lock after 5 failed attempts
    private readonly windowMs = 15 * 60 * 1000; // 15 minute window
    private readonly lockoutMs = 30 * 60 * 1000; // 30 minute lockout

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly audit: AuditLogService,
    ) {}

    // Check if account is locked
    async isAccountLocked(email: string): Promise<{ locked: boolean; remainingTime?: number }> {
        const key = email.toLowerCase();
        const entry = loginAttemptStore.get(key);
        const now = Date.now();

        if (!entry) return { locked: false };

        // Check if locked
        if (entry.lockedUntil && now < entry.lockedUntil) {
            const remainingTime = Math.ceil((entry.lockedUntil - now) / 1000);
            return { locked: true, remainingTime };
        }

        // Reset if window has passed
        if (now - entry.firstAttempt > this.windowMs) {
            loginAttemptStore.delete(key);
            return { locked: false };
        }

        return { locked: false };
    }

    // Record a failed login attempt
    async recordFailedAttempt(email: string, ip?: string): Promise<{ locked: boolean; attemptsRemaining?: number }> {
        const key = email.toLowerCase();
        const now = Date.now();

        let entry = loginAttemptStore.get(key);

        // Reset if window has passed
        if (!entry || now - entry.firstAttempt > this.windowMs) {
            entry = { attempts: 1, firstAttempt: now };
            loginAttemptStore.set(key, entry);

            await this.audit.log(Logs.LOGIN_FAILED, undefined, { email, ip, attempts: 1 });

            return { locked: false, attemptsRemaining: this.maxAttempts - 1 };
        }

        // Increment attempts
        entry.attempts++;

        // Check if should lock
        if (entry.attempts >= this.maxAttempts) {
            entry.lockedUntil = now + this.lockoutMs;
            loginAttemptStore.set(key, entry);

            await this.audit.log(Logs.ADMIN_USER_LOCK, undefined, {
                email,
                ip,
                reason: 'Too many failed login attempts',
                lockedUntil: new Date(entry.lockedUntil).toISOString(),
            });

            // Also update user document to persist lockout
            await this.userModel.updateOne(
                { email: email.toLowerCase() },
                {
                    $set: {
                        lockedUntil: new Date(entry.lockedUntil),
                        failedLoginAttempts: entry.attempts,
                    }
                }
            );

            return { locked: true };
        }

        loginAttemptStore.set(key, entry);

        await this.audit.log(Logs.LOGIN_FAILED, undefined, {
            email,
            ip,
            attempts: entry.attempts,
            attemptsRemaining: this.maxAttempts - entry.attempts,
        });

        return { locked: false, attemptsRemaining: this.maxAttempts - entry.attempts };
    }

    // Clear failed attempts on successful login
    async clearFailedAttempts(email: string): Promise<void> {
        const key = email.toLowerCase();
        loginAttemptStore.delete(key);

        // Clear from database too
        await this.userModel.updateOne(
            { email: email.toLowerCase() },
            {
                $unset: { lockedUntil: 1 },
                $set: { failedLoginAttempts: 0 },
            }
        );
    }

    // Manual unlock by admin
    async unlockAccount(userId: string, adminId: string): Promise<void> {
        const user = await this.userModel.findById(userId);
        if (!user) throw new UnauthorizedException('User not found');

        const key = user.email.toLowerCase();
        loginAttemptStore.delete(key);

        await this.userModel.findByIdAndUpdate(userId, {
            $unset: { lockedUntil: 1 },
            $set: { failedLoginAttempts: 0 },
        });

        await this.audit.log(Logs.ADMIN_USER_UNLOCK, adminId, {
            userId,
            email: user.email,
        });
    }
}

// Cleanup old entries periodically
setInterval(() => {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour

    for (const [key, entry] of loginAttemptStore.entries()) {
        if (now - entry.firstAttempt > maxAge && (!entry.lockedUntil || now > entry.lockedUntil)) {
            loginAttemptStore.delete(key);
        }
    }
}, 10 * 60 * 1000); // Every 10 minutes

