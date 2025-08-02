// src/auth/guards/roles.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../Decorators/RolesDecorator';
import { UserRole } from '../../Database/User'; // Same enum

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (!requiredRoles) {
            return true; // No role restrictions
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        return requiredRoles.includes(user.role);
    }
}
