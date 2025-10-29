

//import { NestFactory } from '@nestjs/core';
//import { AppModule } from './app.module';
//import 'reflect-metadata';

//async function bootstrap() {
  //  const app = await NestFactory.create(AppModule);
    //const port = process.env.PORT || 3111;

    //try {
      //  await app.listen(port);
        //console.log(`Application running on port ${port}`);
    //} catch (error: any) {
      //  if (error.code === 'EADDRINUSE') {
        //    console.error(`Port ${port} is already in use. Please set a different PORT in your .env file.`);
        //} else {
          //  console.error('Error starting server:', error);
       // }
        //process.exit(1);
    //}
//}

//bootstrap();

// src/main.ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';

import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import {AppModule} from "./app.module";
import {NestExpressApplication} from "@nestjs/platform-express";
import {existsSync} from "fs";

//async function bootstrap() {
    //const app = await NestFactory.create(AppModule);
    //const port = process.env.PORT || 3222;

    // 1) CORS (adjust origins as needed)
    //app.enableCors({
        //origin: process.env.CORS_ORIGIN?.split(',') ?? true,
      //  credentials: true,
    //});

    // 2) Global validation (for your DTOs)
    //app.useGlobalPipes(
        //new ValidationPipe({
            //whitelist: true,       // strips unknown props
          //  forbidNonWhitelisted: false,
        //    transform: true,       // auto-transform query/params to types
      //  }),
    //);

    // 3) Serve uploaded files: http://localhost:3111/uploads/<filename>
    //const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
    //app.use('/uploads', express.static(uploadDir));

    //try {
        //await app.listen(port);
        //console.log(`Application running on port ${port}`);
      //  console.log(`Serving uploads from: ${uploadDir}`);
    //} catch (error: any) {
        //if (error.code === 'EADDRINUSE') {
          //  console.error(`Port ${port} is already in use. Set a different PORT in .env.`);
        //} else {
           // console.error('Error starting server:', error);
      //  }
    //    process.exit(1);
  //  }
//}

//bootstrap();

// In backend/src/main.ts





//import * as dotenv from 'dotenv';

//dotenv.config();

//async function bootstrap() {
    //try {
        //const app = await NestFactory.create(AppModule, {
          //  logger: ['error', 'warn', 'log', 'debug', 'verbose']
        //});

        // Setup CORS
        //app.enableCors({
           // origin: process.env.CORS_ORIGIN || true,
         //   credentials: true
       // });

        // Add root handler
        //app.getHttpAdapter().get('/', (req, res) => {
          //  res.json({ status: 'ok', message: 'Server is running' });
       // });

       // const port = process.env.PORT || 3555;

        // Explicitly bind to IPv4 only
        //await app.listen(port, '127.0.0.1');
        //console.log(`Server running at http://127.0.0.1:${port}`);
    //} catch (error) {
       // console.error('Server failed to start:', error);
   // }
//}

//bootstrap();

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Enable CORS
    app.enableCors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
    });
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
        prefix: '/uploads/',
        setHeaders: (res, path) => {
            if (path.endsWith('.mp4')) {
                res.setHeader('Accept-Ranges', 'bytes');
                res.setHeader('Content-Type', 'video/mp4');
            }
        }
    });
    // API prefix
    app.setGlobalPrefix('api');

    // Validation pipe
    app.useGlobalPipes(new ValidationPipe());

    // **CRITICAL FIX**: Serve static files from uploads directory
    const uploadsPath = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
    console.log('Serving static files from:', uploadsPath);

    // Create uploads directory if it doesn't exist
    if (!existsSync(uploadsPath)) {
        const fs = require('fs');
        fs.mkdirSync(uploadsPath, { recursive: true });
    }

    // Serve uploads at /uploads route
    app.useStaticAssets(uploadsPath, {
        prefix: '/uploads/',
        // Add proper headers for video streaming
        setHeaders: (res, path) => {
            if (path.endsWith('.mp4') || path.endsWith('.webm')) {
                res.setHeader('Accept-Ranges', 'bytes');
                res.setHeader('Content-Type', 'video/mp4');
            }
            if (path.endsWith('.pdf')) {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'inline');
            }
        }
    });

    const port = process.env.PORT || 5000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();