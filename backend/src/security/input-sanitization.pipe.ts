import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class SanitizeInputPipe implements PipeTransform {
    transform(value: any) {
        if (typeof value === 'string') {
            return this.sanitizeString(value);
        }

        if (typeof value === 'object' && value !== null) {
            return this.sanitizeObject(value);
        }

        return value;
    }

    private sanitizeString(str: string): string {
        // Remove HTML tags
        let sanitized = sanitizeHtml(str, {
            allowedTags: [], // No HTML tags allowed
            allowedAttributes: {},
        });

        // Trim whitespace
        sanitized = sanitized.trim();

        // Prevent NoSQL injection - remove MongoDB operators
        if (sanitized.includes('$')) {
            sanitized = sanitized.replace(/\$/g, '');
        }

        return sanitized;
    }

    private sanitizeObject(obj: any): any {
        if (Array.isArray(obj)) {
            return obj.map(item => this.transform(item));
        }

        const sanitized: any = {};
        for (const key of Object.keys(obj)) {
            // Prevent prototype pollution
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                continue;
            }

            // Prevent MongoDB operator injection in keys
            if (key.startsWith('$')) {
                throw new BadRequestException('Invalid input: operator keys not allowed');
            }

            sanitized[key] = this.transform(obj[key]);
        }

        return sanitized;
    }
}

// Validation utilities
export function isValidObjectId(id: string): boolean {
    return /^[a-fA-F0-9]{24}$/.test(id);
}

export function sanitizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return { valid: errors.length === 0, errors };
}

