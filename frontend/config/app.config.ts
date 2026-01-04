// src/config/app.config.ts (USE THIS ONE - DELETE config/api.ts)
export const APP_CONFIG = {
    API: {
        BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
        TIMEOUT: 30000,
    },
    ROUTES: {
        PUBLIC: [
            '/',
            '/login',
            '/server/register',
            '/server/verify-otp',
            '/server/forgot-password',
            '/server/reset-password',
            '/server/mfa-verify'
        ],
        AUTH: {
            LOGIN: '/login',
            REGISTER: '/server/register',
            LOGOUT: '/server/logout',
            VERIFY_OTP: '/server/verify-otp',
            RESEND_OTP: '/server/resend-otp',
            FORGOT_PASSWORD: '/server/forgot-password',
            RESET_PASSWORD: '/server/reset-password',
            MFA_VERIFY: '/server/mfa-verify',


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
