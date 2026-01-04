import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserRole, AccountStatus } from "../database/user";
import { AuditLog } from "../database/audit-log";
import { AuditLogService } from "../audit-log/audit-logging.service";
import { CreateUserDto } from "../dto's/user-dtos's";
import { Logs } from "../audit-log/Logs";
import { MailService } from "../auth/email/email-service";


@Injectable()
export class AdminService {

    constructor(
        @InjectModel(User.name) private readonly users: Model<User>,
        @InjectModel(AuditLog.name) private readonly auditModel: Model<AuditLog>,
        private readonly audit: AuditLogService,
        private readonly mail: MailService,
    ) {}


    async createUserByAdmin(dto: CreateUserDto, adminId: string) {
        // Check if email already exists
        const existing = await this.users.findOne({ email: dto.email.toLowerCase() });
        if (existing) throw new BadRequestException('Email already in use');

        const user = await this.users.create({
            ...dto,
            email: dto.email.toLowerCase(),
            passwordHash: await bcrypt.hash(dto.password, 12),
            status: AccountStatus.ACTIVE,
            isEmailVerified: true, // Admin-created users are pre-verified
        });

        await this.audit.record(Logs.ADMIN_CREATED_USER, adminId, {
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
        });

        return { userId: user._id, email: user.email, role: user.role };
    }


    async updateUserRole(userId: string, adminId: string, newRole: UserRole) {
        const user = await this.users.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        const oldRole = user.role;
        const doc = await this.users.findByIdAndUpdate(userId, { role: newRole }, { new: true });

        await this.audit.record(Logs.ROLE_CHANGED, adminId, { userId, oldRole, newRole });

        return { userId, oldRole, newRole };
    }


    async listUsers(params: {
        q?: string;
        role?: UserRole;
        status?: AccountStatus;
        verified?: 'true' | 'false';
        page?: number;
        limit?: number;
    }) {
        const page = Math.max(1, Number(params.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
        const skip = (page - 1) * limit;

        const q: FilterQuery<User> = {};
        if (params.role) q.role = params.role;
        if (params.status) q.status = params.status;
        if (params.verified) q.isEmailVerified = params.verified === 'true';
        if (params.q) {
            q.$or = [
                { name: { $regex: params.q, $options: 'i' } },
                { email: { $regex: params.q, $options: 'i' } },
            ];
        }

        const items = await this.users
            .find(q)
            .select('-passwordHash -mfaSecret -mfaBackupCodes -otpCode -passwordResetOtpCode')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await this.users.countDocuments(q);

        return { items, total, page, limit, pages: Math.ceil(total / limit) };
    }


    async metrics() {
        const now = new Date();
        const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [
            totalUsers,
            byRoleAgg,
            byStatusAgg,
            verifiedCount,
            unverifiedCount,
            mfaEnabledCount,
            failedLogins24h,
            unauthorized24h,
            tokenBlacklisted24h,
            loginSuccess24h,
            passwordResetRequests24h,
            newRegistrations24h,
            lockedAccounts,
            suspendedAccounts,
        ] = await Promise.all([
            this.users.countDocuments({}),
            this.users.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
            this.users.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            this.users.countDocuments({ isEmailVerified: true }),
            this.users.countDocuments({ isEmailVerified: false }),
            this.users.countDocuments({ mfaEnabled: true }),
            this.auditModel.countDocuments({ event: Logs.LOGIN_FAILED, timestamp: { $gte: dayAgo } }),
            this.auditModel.countDocuments({ event: Logs.UNAUTHORIZED_ACCESS, timestamp: { $gte: dayAgo } }),
            this.auditModel.countDocuments({ event: Logs.TOKEN_BLACKLISTED, timestamp: { $gte: dayAgo } }),
            this.auditModel.countDocuments({ event: Logs.LOGIN_SUCCESS, timestamp: { $gte: dayAgo } }),
            this.auditModel.countDocuments({ event: Logs.PASSWORD_RESET_REQUESTED, timestamp: { $gte: dayAgo } }),
            this.users.countDocuments({ createdAt: { $gte: dayAgo } }),
            this.users.countDocuments({ status: AccountStatus.LOCKED }),
            this.users.countDocuments({ status: AccountStatus.SUSPENDED }),
        ]);

        const byRole: Record<string, number> = {};
        byRoleAgg.forEach((r: any) => byRole[r._id ?? 'unknown'] = r.count);

        const byStatus: Record<string, number> = {};
        byStatusAgg.forEach((s: any) => byStatus[s._id ?? 'unknown'] = s.count);

        const mfaEnabledPercent = totalUsers ? Math.round((mfaEnabledCount / totalUsers) * 10000) / 100 : 0;
        const verifiedPercent = totalUsers ? Math.round((verifiedCount / totalUsers) * 10000) / 100 : 0;

        return {
            users: {
                total: totalUsers,
                byRole,
                byStatus,
                verified: verifiedCount,
                unverified: unverifiedCount,
                verifiedPercent,
                mfaEnabled: mfaEnabledCount,
                mfaEnabledPercent,
                newRegistrations24h,
            },
            security: {
                failedLogins24h,
                unauthorizedAccess24h: unauthorized24h,
                tokenBlacklisted24h,
                loginSuccess24h,
                passwordResetRequests24h,
                lockedAccounts,
                suspendedAccounts,
            },
            generatedAt: now.toISOString(),
        };
    }


    async securityOverview(params?: { limit?: number; from?: string; to?: string }) {
        const limit = Math.min(200, Math.max(1, Number(params?.limit ?? 50)));
        const to = params?.to ? new Date(params.to) : new Date();
        const from = params?.from ? new Date(params.from) : new Date(to.getTime() - 24 * 60 * 60 * 1000);

        const q: FilterQuery<AuditLog> = {
            timestamp: { $gte: from, $lte: to },
            event: {
                $in: [
                    Logs.LOGIN_FAILED,
                    Logs.UNAUTHORIZED_ACCESS,
                    Logs.TOKEN_BLACKLISTED,
                    Logs.RBAC_DENIED,
                    Logs.ADMIN_FORCE_LOGOUT,
                    Logs.ADMIN_USER_LOCK,
                    Logs.ADMIN_USER_UNLOCK,
                    Logs.ADMIN_USER_SUSPEND,
                    Logs.ADMIN_USER_TERMINATE,
                    Logs.ACCOUNT_LOCKED,
                    Logs.ACCOUNT_SUSPENDED,
                ],
            },
        };

        const items = await this.auditModel.find(q).sort({ timestamp: -1 }).limit(limit).lean();

        return {
            window: { from: from.toISOString(), to: to.toISOString() },
            count: items.length,
            items,
        };
    }

    // Unlock user account (clear lockout)
    async unlockUserAccount(userId: string, adminId: string) {
        const user = await this.users.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        await this.users.findByIdAndUpdate(userId, {
            status: AccountStatus.ACTIVE,
            failedLoginAttempts: 0,
            $unset: { lockedUntil: 1 },
            statusReason: 'Unlocked by admin',
            statusChangedAt: new Date(),
            statusChangedBy: new Types.ObjectId(adminId),
        });

        await this.audit.record(Logs.ADMIN_USER_UNLOCK, adminId, {
            userId,
            email: user.email,
        });

        // Send email notification
        try {
            await this.mail.sendAccountUnlockedEmail(user.email, user.name || 'User');
        } catch (e) {
            console.error('Failed to send account unlocked email:', e);
        }

        return { success: true, userId, status: AccountStatus.ACTIVE };
    }

    // Lock user account manually
    async lockUserAccount(userId: string, adminId: string, reason: string) {
        const user = await this.users.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        const lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours for manual lock

        await this.users.findByIdAndUpdate(userId, {
            status: AccountStatus.LOCKED,
            lockedUntil: lockUntil,
            statusReason: reason || 'Locked by admin',
            statusChangedAt: new Date(),
            statusChangedBy: new Types.ObjectId(adminId),
        });

        await this.audit.record(Logs.ADMIN_USER_LOCK, adminId, {
            userId,
            email: user.email,
            reason,
        });

        // Send email notification
        try {
            await this.mail.sendAccountLockedEmail(user.email, user.name || 'User', reason || 'Locked by administrator', lockUntil);
        } catch (e) {
            console.error('Failed to send account locked email:', e);
        }

        return { success: true, userId, status: AccountStatus.LOCKED };
    }

    // Suspend user account
    async suspendUserAccount(userId: string, adminId: string, reason: string) {
        const user = await this.users.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        await this.users.findByIdAndUpdate(userId, {
            status: AccountStatus.SUSPENDED,
            statusReason: reason || 'Suspended by admin',
            statusChangedAt: new Date(),
            statusChangedBy: new Types.ObjectId(adminId),
        });

        await this.audit.record(Logs.ADMIN_USER_SUSPEND, adminId, {
            userId,
            email: user.email,
            reason,
        });

        return { success: true, userId, status: AccountStatus.SUSPENDED };
    }

    // Terminate user account
    async terminateUserAccount(userId: string, adminId: string, reason: string) {
        const user = await this.users.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        await this.users.findByIdAndUpdate(userId, {
            status: AccountStatus.TERMINATED,
            statusReason: reason || 'Terminated by admin',
            statusChangedAt: new Date(),
            statusChangedBy: new Types.ObjectId(adminId),
        });

        await this.audit.record(Logs.ADMIN_USER_TERMINATE, adminId, {
            userId,
            email: user.email,
            reason,
        });

        return { success: true, userId, status: AccountStatus.TERMINATED };
    }

    // Reactivate user account
    async reactivateUserAccount(userId: string, adminId: string) {
        const user = await this.users.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        await this.users.findByIdAndUpdate(userId, {
            status: AccountStatus.ACTIVE,
            failedLoginAttempts: 0,
            $unset: { lockedUntil: 1 },
            statusReason: 'Reactivated by admin',
            statusChangedAt: new Date(),
            statusChangedBy: new Types.ObjectId(adminId),
        });

        await this.audit.record(Logs.ACCOUNT_REACTIVATED, adminId, {
            userId,
            email: user.email,
        });

        return { success: true, userId, status: AccountStatus.ACTIVE };
    }

    // Change user status with reason
    async changeUserStatus(userId: string, adminId: string, newStatus: AccountStatus, reason: string) {
        const user = await this.users.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        const oldStatus = user.status;

        const updateData: any = {
            status: newStatus,
            statusReason: reason,
            statusChangedAt: new Date(),
            statusChangedBy: new Types.ObjectId(adminId),
        };

        if (newStatus === AccountStatus.ACTIVE) {
            updateData.failedLoginAttempts = 0;
            updateData.$unset = { lockedUntil: 1 };
        }

        await this.users.findByIdAndUpdate(userId, updateData);

        await this.audit.record(Logs.ADMIN_STATUS_CHANGE, adminId, {
            userId,
            email: user.email,
            oldStatus,
            newStatus,
            reason,
        });

        return { success: true, userId, oldStatus, newStatus };
    }
}
