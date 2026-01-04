import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

const cookieParser = require('cookie-parser');

// Request Logger Middleware
function requestLogger(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, url, originalUrl, path } = req;
    const userAgent = req.get('user-agent') || 'Unknown';
    const ip = req.ip || req.socket.remoteAddress;
    const authHeader = req.get('authorization') ? 'Bearer [PRESENT]' : '[NONE]';
    const cookies = req.cookies ? Object.keys(req.cookies).join(', ') || '[NONE]' : '[NONE]';

    // Log incoming request
    console.log('\n========================================');
    console.log(`INCOMING REQUEST`);
    console.log(`========================================`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Method: ${method}`);
    console.log(`URL: ${originalUrl || url}`);
    console.log(`Path: ${path}`);
    console.log(`IP: ${ip}`);
    console.log(`Auth: ${authHeader}`);
    console.log(`Cookies: ${cookies}`);
    console.log(`User-Agent: ${userAgent.substring(0, 50)}...`);

    if (Object.keys(req.body || {}).length > 0) {
        // Don't log passwords
        const sanitizedBody = { ...req.body };
        if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
        if (sanitizedBody.passwordHash) sanitizedBody.passwordHash = '[REDACTED]';
        if (sanitizedBody.newPassword) sanitizedBody.newPassword = '[REDACTED]';
        if (sanitizedBody.oldPassword) sanitizedBody.oldPassword = '[REDACTED]';
        console.log(`📦 Body: ${JSON.stringify(sanitizedBody).substring(0, 200)}`);
    }

    if (Object.keys(req.query || {}).length > 0) {
        console.log(`❓ Query: ${JSON.stringify(req.query)}`);
    }

    // Log response when it finishes
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        const statusEmoji = statusCode < 400 ? '✅' : statusCode < 500 ? '⚠️' : '❌';

        console.log(`${statusEmoji} RESPONSE: ${statusCode} | Duration: ${duration}ms`);
        console.log('========================================\n');
    });

    next();
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Add request logger FIRST (before other middleware)
    app.use(requestLogger);

    // Security middleware - Helmet for various HTTP headers
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
                scriptSrc: ["'self'", "'unsafe-inline'"], // Required for Swagger
            },
        },
        crossOriginEmbedderPolicy: false, // Required for Swagger UI
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
        },
    }));

    app.use(cookieParser());

    // Global validation pipe with security options - OWASP compliant
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,              // Strip non-whitelisted properties
        transform: true,              // Transform payloads to DTO instances
        forbidNonWhitelisted: true,   // Throw error on non-whitelisted properties
        forbidUnknownValues: true,    // Throw error on unknown values
        disableErrorMessages: process.env.NODE_ENV === 'production', // Hide error details in production
        transformOptions: {
            enableImplicitConversion: false, // Strict type conversion
        },
    }));

    // // CORS configuration - OWASP compliant
    // const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    //     'http://localhost:3999',
    //     'http://localhost:3000',
    //     'http://localhost:5000',
    // ];

    // origin: (origin, callback) => {
    //     // Allow requests with no origin (mobile apps, curl, etc.)
    //     if (!origin || allowedOrigins.includes(origin)) {
    //         callback(null, true);
    //     } else {
    //         callback(new Error('Not allowed by CORS'));
    //     }
    // },

    app.enableCors({
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
        exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Limit'],
        maxAge: 86400, // 24 hours
    });

    // Swagger setup (disable in production if needed)
    if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
        const config = new DocumentBuilder()
            .setTitle('E-Learning Platform API')
            .setDescription(`
## API documentation for the E-Learning Platform

### Authentication
This API uses **HTTP-Only Cookie Authentication**. After successful login, an \`access_token\` cookie is automatically set.

### Security Features
- JWT-based authentication with HTTP-only cookies
- Role-Based Access Control (RBAC)
- Account lockout after 5 failed attempts
- Rate limiting (100 requests/minute)
- Input validation and sanitization
            `)
            .setVersion('1.0')
            .addCookieAuth('access_token', {
                type: 'apiKey',
                in: 'cookie',
                name: 'access_token',
                description: 'JWT token stored in HTTP-only cookie',
            })
            .addBearerAuth({
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                in: 'header',
                description: 'Alternative: Bearer token in Authorization header',
            }, 'bearer-token')
            .addTag('auth', 'Authentication & Authorization')
            .addTag('users', 'User Profile Management')
            .addTag('courses', 'Course Management')
            .addTag('quizzes', 'Quiz & Assessment Management')
            .addTag('forums', 'Discussion Forums')
            .addTag('chat', 'Real-time Messaging')
            .addTag('notifications', 'Notification System')
            .addTag('analytics', 'Performance Analytics')
            .addTag('admin', 'Admin Operations')
            .addTag('audit', 'Audit Logging')
            .build();

        const document = SwaggerModule.createDocument(app, config, {});
        SwaggerModule.setup('api', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
            },
        });
    }

    // Trust proxy for correct IP detection behind reverse proxy
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.set('trust proxy', 1);

    // Disable X-Powered-By header
    expressApp.disable('x-powered-by');

    const port = Number(process.env.PORT) || 5000;
    await app.listen(port);

    console.log(`Application running on http://localhost:${port}`);
    console.log(`Swagger API docs: http://localhost:${port}/api`);

}

bootstrap();
