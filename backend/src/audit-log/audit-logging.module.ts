import { Global, Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLog, AuditLogSchema } from "../database/audit-log";
import { AuthModule } from "../auth/authentication-module";
import { AuditLogService } from "./audit-logging.service";
import { AuditLogController } from "./audit-logging.controller";


@Global()
@Module({
    imports: [
        MongooseModule.forFeature([{ name: AuditLog.name, schema: AuditLogSchema }]),
        forwardRef(() => AuthModule),
    ],

    providers: [AuditLogService],
    controllers: [AuditLogController],
    exports: [AuditLogService],
})
export class AuditLogModule {}