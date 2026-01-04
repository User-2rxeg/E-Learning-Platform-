import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuickNotesController } from './quick-notes.controller';
import { QuickNotesService } from './quick-notes.service';
import { QuickNote, QuickNoteSchema } from '../database/quick-notes';
import {AuthModule} from "../auth/authentication-module";


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: QuickNote.name, schema: QuickNoteSchema },

        ]),
        AuthModule,
    ],
    controllers: [QuickNotesController],
    providers: [QuickNotesService],
    exports: [QuickNotesService, MongooseModule],
})
export class QuickNotesModule {}
