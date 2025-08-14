//import { ExecutionContext, Injectable } from '@nestjs/common';
//import { Reflector } from '@nestjs/core';
//import { AuthGuard } from '@nestjs/passport';
//import { IS_PUBLIC_KEY } from '../Decorators/Public-Decorator';

//@Injectable()
//export class JwtAuthGuard extends AuthGuard('jwt') {
//constructor(private readonly reflector: Reflector) {
  //      super();
    //}

    //canActivate(context: ExecutionContext) {
      //  const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        //    context.getHandler(),
          //  context.getClass(),
        //]);
        //if (isPublic) return true;
        //return super.canActivate(context);
   // }
//}

import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as NestAuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../Decorators/Public-Decorator';
import { AuditLogService } from '../../Audit-Log/Audit-Log.Service';         // ⬅ add
import { AuthService } from '../AuthService';                               // ⬅ add
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends NestAuthGuard('jwt') {
    constructor(
        private readonly reflector: Reflector,
        private readonly audit: AuditLogService,    // ⬅ add
        private readonly auth: AuthService,         // ⬅ add
    ) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) return true;
        return super.canActivate(context);
    }

    // runs after passport strategy
    async HandleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        const ctx = context.switchToHttp();
        const req = ctx.getRequest<Request>();
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const path = req.originalUrl;

        // If JWT validation failed at passport level
        if (err || !user) {
            await this.audit.log('UNAUTHORIZED_ACCESS', undefined, {
                path, ip, reason: info?.message || 'NO_USER', authHeader: req.headers.authorization ? 'present' : 'absent',
            });
            throw err || new UnauthorizedException();
        }

        // Blacklist enforcement
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

        if (token && (await this.auth.isTokenBlacklisted(token))) {
            await this.audit.log('UNAUTHORIZED_ACCESS', user?.sub, {
                path, ip, reason: 'BLACKLISTED_TOKEN',
            });
            throw new UnauthorizedException('Token blacklisted');
        }

        return user;
    }
}