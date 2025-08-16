import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Forum, ForumSchema } from '../../Database/Forum';
import {ForumController} from "./Forum.Controller";
import {ForumService} from "./Forum.Service";
import {AuthModule} from "../../Authentication/AuthModule";


@Module({
    imports: [
        MongooseModule.forFeature([{ name: Forum.name, schema: ForumSchema }]),
        AuthModule,
    ],
    controllers: [ForumController],
    providers: [ForumService],
    exports: [ForumService], // Optional: if needed in other modules
})
export class ForumModule {}