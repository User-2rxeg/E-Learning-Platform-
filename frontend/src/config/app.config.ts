// src/config/app.config.ts (USE THIS ONE - DELETE config/api.ts)
export const APP_CONFIG = {
    API: {
        BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3654',
        TIMEOUT: 30000,
    },
    ROUTES: {
        PUBLIC: [
            '/',
            '/auth/login',
            '/auth/register',
            '/auth/verify-otp',
            '/auth/forgot-password',
            '/auth/reset-password',
            '/auth/mfa-verify'
        ],
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            LOGOUT: '/auth/logout',
            VERIFY_OTP: '/auth/verify-otp',
            RESEND_OTP: '/auth/resend-otp',
            FORGOT_PASSWORD: '/auth/forgot-password',
            RESET_PASSWORD: '/auth/reset-password',
            MFA_VERIFY: '/auth/mfa-verify',


            // ... rest of routes
        },
        // ... other route groups
    },
    COOKIES: {
        ACCESS_TOKEN: 'access_token',
        REFRESH_TOKEN: 'refresh_token'
    },
    STORAGE: {
        TEMP_TOKEN: 'mfa_temp_token',
        PENDING_EMAIL: 'pending_email',
        RESET_EMAIL: 'reset_email',
        USER_CACHE: 'user_cache'
    }
};