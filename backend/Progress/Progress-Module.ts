// backend/Progress/Progress.Module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProgressController } from './Progress-Controller';
import { ProgressService } from './Progress-Service';
import { Performance, PerformanceSchema } from '../Database/Performance';
import {AuthModule} from "../Authentication/AuthModule";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Performance.name, schema: PerformanceSchema },
        ]),
        AuthModule,
    ],
    controllers: [ProgressController],
    providers: [ProgressService],
    exports: [ProgressService, MongooseModule],
})
export class ProgressModule {}
