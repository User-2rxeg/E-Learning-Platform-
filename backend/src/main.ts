import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const port = process.env.PORT || 3000;

    try {
        await app.listen(port);
        console.log(`Application running on port ${port}`);
    } catch (error) {
        if (error.code === 'EADDRINUSE') {
            console.error(`Port ${port} is already in use. Please set a different PORT in your .env file.`);
        } else {
            console.error('Error starting server:', error);
        }
        process.exit(1);
    }
}
bootstrap();