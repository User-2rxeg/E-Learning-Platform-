import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from '../../Database/Chat';
import { User, UserSchema } from '../../Database/User';
;
import { AuthModule } from '../../Authentication/AuthModule';
import {ChatController} from "./Chat-Controller";
import {ChatService} from "./Chat-Service";
import {ChatGateway} from "./Chat-Gateway";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Chat.name, schema: ChatSchema },
            { name: User.name, schema: UserSchema },
        ]),
        AuthModule, // for JwtService in the gateway
    ],
    controllers: [ChatController],
    providers: [ChatService,ChatGateway],
    exports: [ChatService],
})
export class ChatModule {}