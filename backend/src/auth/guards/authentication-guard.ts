import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
import { AuthGuard as NestAuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public-decorator';
import { AuthService } from '../services/authentication-service';
import { AccountStatus } from '../../database/user';


@Injectable()
export class AuthenticationGuard extends NestAuthGuard('jwt') {
    constructor(
        private readonly reflector: Reflector,
        private readonly auth: AuthService,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Allow @Public routes
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) return true;

        try {
            await super.canActivate(context);
        } catch (err) {
            throw err;
        }

        // Token exists & valid at this point
        const req = context.switchToHttp().getRequest<Request>();
        const user = (req as any).user;

        if (!user) {
            throw new UnauthorizedException('Unauthorized');
        }

        // Get token from cookie or header
        const token = (req as any).cookies?.access_token ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!token) throw new UnauthorizedException('Missing authentication token');

        // Check if token is blacklisted
        const isBlacklisted = await this.auth.isAccessTokenBlacklisted(token);
        if (isBlacklisted) {
            throw new UnauthorizedException('Session expired. Please sign in again.');
        }

        // Check account status
        const accountStatus = await this.auth.getAccountStatus(user.sub);

        if (accountStatus === AccountStatus.LOCKED) {
            throw new ForbiddenException('Account is locked due to security reasons. Please contact support.');
        }

        if (accountStatus === AccountStatus.SUSPENDED) {
            throw new ForbiddenException('Account is suspended. Please contact support.');
        }

        if (accountStatus === AccountStatus.TERMINATED) {
            throw new ForbiddenException('Account has been terminated.');
        }

        if (accountStatus === AccountStatus.INACTIVE) {
            throw new ForbiddenException('Account is inactive. Please reactivate your account.');
        }

        return true;
    }
}
