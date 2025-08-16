import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Performance, PerformanceSchema } from '../../Database/Performance';
import {PerformanceController} from "./Performance.Controller";
import {PerformanceService} from "./Performance.Service";
import {AuthModule} from "../../Authentication/AuthModule";


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