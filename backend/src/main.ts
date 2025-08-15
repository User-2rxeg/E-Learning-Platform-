

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

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const port = process.env.PORT || 3111;

    // 1) CORS (adjust origins as needed)
    app.enableCors({
        origin: process.env.CORS_ORIGIN?.split(',') ?? true,
        credentials: true,
    });

    // 2) Global validation (for your DTOs)
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,       // strips unknown props
            forbidNonWhitelisted: false,
            transform: true,       // auto-transform query/params to types
        }),
    );

    // 3) Serve uploaded files: http://localhost:3111/uploads/<filename>
    const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
    app.use('/uploads', express.static(uploadDir));

    try {
        await app.listen(port);
        console.log(`Application running on port ${port}`);
        console.log(`Serving uploads from: ${uploadDir}`);
    } catch (error: any) {
        if (error.code === 'EADDRINUSE') {
            console.error(`Port ${port} is already in use. Set a different PORT in .env.`);
        } else {
            console.error('Error starting server:', error);
        }
        process.exit(1);
    }
}

bootstrap();
