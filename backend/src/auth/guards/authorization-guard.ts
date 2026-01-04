import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {ROLES_KEY} from "../decorators/roles-decorator";
import {UserRole} from "../../database/user";


@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (!requiredRoles) return true;

        const req = context.switchToHttp().getRequest();
        const user = req.user as { role?: UserRole } | undefined;
        return !!user?.role && requiredRoles.includes(user.role);
    }
}
