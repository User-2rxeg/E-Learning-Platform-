import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from '../../Database/Conversation';
import { Message, MessageSchema } from '../../Database/Message';
import { User, UserSchema } from '../../Database/User';
import { AuthModule } from '../../Authentication/AuthModule';
import { ChatController } from './Chat-Controller';
import { ChatService } from './Chat-Service';
import { ChatGateway } from './Chat-Gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Conversation.name, schema: ConversationSchema },
            { name: Message.name, schema: MessageSchema },
            { name: User.name, schema: UserSchema },
        ]),
        AuthModule,
        JwtModule.register({}), // ensure same secret as HTTP auth
    ],
    controllers: [ChatController],
    providers: [ChatService, ChatGateway],
    exports: [ChatService],
})
export class ChatModule {}