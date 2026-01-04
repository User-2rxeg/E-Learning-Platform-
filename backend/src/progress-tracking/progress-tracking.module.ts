import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProgressTrackingController } from './progress-tracking.controller';
import { ProgressTrackingService } from './progress-tracking.service';
import { Performance, PerformanceSchema } from '../database/performance';
import {AuthModule} from "../auth/authentication-module";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Performance.name, schema: PerformanceSchema },
        ]),
        AuthModule,
    ],
    controllers: [ProgressTrackingController],
    providers: [ProgressTrackingService],
    exports: [ProgressTrackingService, MongooseModule],
})
export class ProgressTrackingModule {}
