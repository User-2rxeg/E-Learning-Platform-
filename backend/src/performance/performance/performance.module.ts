import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Performance, PerformanceSchema } from '../../database/performance';
import {PerformanceController} from "./performance.controller";
import {PerformanceService} from "./performance.service";
import {AuthModule} from "../../auth/authentication-module";



@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Performance.name, schema: PerformanceSchema }
        ]),
        AuthModule,
    ],
    controllers: [PerformanceController],
    providers: [PerformanceService],
    exports: [PerformanceService],
})
export class PerformanceModule {}