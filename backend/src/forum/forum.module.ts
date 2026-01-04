import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Forum, ForumSchema } from '../database/forum';
import { ForumController } from "./forum.controller";
import { ForumService } from "./forum.service";
import { AuthModule } from "../auth/authentication-module";
import { AuditLogModule } from "../audit-log/audit-logging.module";


@Module({
    imports: [
        MongooseModule.forFeature([{ name: Forum.name, schema: ForumSchema }]),
        AuthModule,
        AuditLogModule,
    ],
    controllers: [ForumController],
    providers: [ForumService],
    exports: [ForumService],
})
export class ForumModule {}