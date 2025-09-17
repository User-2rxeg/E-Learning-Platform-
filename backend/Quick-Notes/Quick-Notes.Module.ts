// backend/Quick-Notes/Quick-Notes.Module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuickNotesController } from './Quick-Notes.Controller';
import { QuickNotesService } from './Quick-Notes.Service';
import { QuickNote, QuickNoteSchema } from '../Database/Quick-Notes';
import {AuthModule} from "../Authentication/AuthModule";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'QuickNote', schema: QuickNoteSchema }, // matches @InjectModel('QuickNote')
            // Alternatively, if you prefer the class name:
            // { name: QuickNote.name, schema: QuickNoteSchema },
        ]),
        AuthModule,
    ],
    controllers: [QuickNotesController],
    providers: [QuickNotesService],
    exports: [QuickNotesService, MongooseModule],
})
export class QuickNotesModule {}
