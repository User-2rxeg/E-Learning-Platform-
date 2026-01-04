import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from '../database/conversation';
import { Message, MessageSchema } from '../database/message';
import { User, UserSchema } from '../database/user';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AuthModule } from '../auth/authentication-module';
import { AuditLogModule } from '../audit-log/audit-logging.module';
import { MailModule } from '../auth/email/email-module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Conversation.name, schema: ConversationSchema },
            { name: Message.name, schema: MessageSchema },
            { name: User.name, schema: UserSchema },
        ]),
        AuthModule,
        AuditLogModule,
        MailModule,
    ],
    controllers: [ChatController],
    providers: [ChatService],
    exports: [ChatService],
})
export class ChatModule {}
