import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// Simple in-memory rate limiting (for production, use Redis)
interface RateLimitEntry {
    count: number;
    firstRequest: number;
    blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export const RATE_LIMIT_KEY = 'rateLimit';

export interface RateLimitOptions {
    windowMs: number;      // Time window in milliseconds
    maxRequests: number;   // Maximum requests per window
    blockDurationMs?: number; // How long to block after exceeding (optional)
}

// Decorator to set rate limit on routes
export function RateLimit(options: RateLimitOptions) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        Reflect.defineMetadata(RATE_LIMIT_KEY, options, target, propertyKey);
        return descriptor;
    };
}

@Injectable()
export class RateLimitGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const options = this.reflector.get<RateLimitOptions>(
            RATE_LIMIT_KEY,
            context.getHandler()
        );

        // If no rate limit decorator, use default limits
        const rateLimitOptions = options || {
            windowMs: 60 * 1000, // 1 minute default
            maxRequests: 100,    // 100 requests per minute default
        };

        const request = context.switchToHttp().getRequest();
        const key = this.getKey(request);
        const now = Date.now();

        let entry = rateLimitStore.get(key);

        // Check if currently blocked
        if (entry?.blockedUntil && now < entry.blockedUntil) {
            const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
            throw new HttpException(
                {
                    statusCode: HttpStatus.TOO_MANY_REQUESTS,
                    message: 'Too many requests. Please try again later.',
                    retryAfter,
                },
                HttpStatus.TOO_MANY_REQUESTS
            );
        }

        // Reset if window has passed
        if (!entry || now - entry.firstRequest > rateLimitOptions.windowMs) {
            entry = { count: 1, firstRequest: now };
            rateLimitStore.set(key, entry);
            return true;
        }

        // Increment count
        entry.count++;

        // Check if exceeded
        if (entry.count > rateLimitOptions.maxRequests) {
            if (rateLimitOptions.blockDurationMs) {
                entry.blockedUntil = now + rateLimitOptions.blockDurationMs;
            }
            rateLimitStore.set(key, entry);

            throw new HttpException(
                {
                    statusCode: HttpStatus.TOO_MANY_REQUESTS,
                    message: 'Too many requests. Please try again later.',
                    retryAfter: Math.ceil(rateLimitOptions.windowMs / 1000),
                },
                HttpStatus.TOO_MANY_REQUESTS
            );
        }

        rateLimitStore.set(key, entry);
        return true;
    }

    private getKey(request: any): string {
        // Use IP + user ID (if authenticated) for rate limiting
        const ip = request.ip || request.connection?.remoteAddress || 'unknown';
        const userId = request.user?.sub || 'anonymous';
        const path = request.route?.path || request.path;
        return `${ip}:${userId}:${path}`;
    }
}

// Cleanup old entries periodically (every 5 minutes)
setInterval(() => {
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutes

    for (const [key, entry] of rateLimitStore.entries()) {
        if (now - entry.firstRequest > maxAge && (!entry.blockedUntil || now > entry.blockedUntil)) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

