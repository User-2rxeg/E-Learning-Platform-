import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from "@nestjs/common";
import {Model, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {QuickNote, QuickNoteDocument} from "../Database/Quick-Notes";

// backend/Quick-Notes/Quick-Notes.Service.ts - UPDATED SERVICE

@Injectable()
export class QuickNotesService {
    constructor(
        @InjectModel('QuickNote') private readonly quickNoteModel: Model<QuickNoteDocument>
    ) {}

    async createNote(studentId: string, noteData: {
        courseId: string;
        moduleIndex: number;
        content: string;
        resourceId?: string;
        timestamp?: Date;
    }): Promise<QuickNote> {
        if (!Types.ObjectId.isValid(studentId) || !Types.ObjectId.isValid(noteData.courseId)) {
            throw new BadRequestException('Invalid IDs');
        }

        const note = new this.quickNoteModel({
            studentId: new Types.ObjectId(studentId),
            courseId: new Types.ObjectId(noteData.courseId),
            moduleIndex: noteData.moduleIndex,
            resourceId: noteData.resourceId,
            content: noteData.content.trim(),
            timestamp: noteData.timestamp || new Date()
        });

        const savedNote = await note.save();

        return {
            id: savedNote._id.toString(),
            courseId: noteData.courseId,
            moduleIndex: noteData.moduleIndex,
            resourceId: noteData.resourceId,
            content: noteData.content,
            timestamp: savedNote.timestamp
        } as any;
    }

    async getNotesByCourse(studentId: string, courseId: string): Promise<QuickNote[]> {
        if (!Types.ObjectId.isValid(studentId) || !Types.ObjectId.isValid(courseId)) {
            throw new BadRequestException('Invalid IDs');
        }

        const notes = await this.quickNoteModel
            .find({
                studentId: new Types.ObjectId(studentId),
                courseId: new Types.ObjectId(courseId)
            })
            .sort({ createdAt: -1 })
            .exec();

        return notes.map(note => ({
            id: note._id.toString(),
            courseId: courseId,
            moduleIndex: note.moduleIndex,
            resourceId: note.resourceId,
            content: note.content,
            timestamp: note.timestamp
        } as any));
    }

    async deleteNote(studentId: string, noteId: string): Promise<void> {
        if (!Types.ObjectId.isValid(studentId) || !Types.ObjectId.isValid(noteId)) {
            throw new BadRequestException('Invalid IDs');
        }

        const note = await this.quickNoteModel.findById(noteId).exec();
        if (!note) {
            throw new NotFoundException('Note not found');
        }

        // Ensure the note belongs to the requesting student
        if (!note.studentId.equals(new Types.ObjectId(studentId))) {
            throw new ForbiddenException('You can only delete your own notes');
        }

        await this.quickNoteModel.findByIdAndDelete(noteId).exec();
    }

    async updateNote(studentId: string, noteId: string, content: string): Promise<QuickNote> {
        if (!Types.ObjectId.isValid(studentId) || !Types.ObjectId.isValid(noteId)) {
            throw new BadRequestException('Invalid IDs');
        }

        const note = await this.quickNoteModel.findById(noteId).exec();
        if (!note) {
            throw new NotFoundException('Note not found');
        }

        if (!note.studentId.equals(new Types.ObjectId(studentId))) {
            throw new ForbiddenException('You can only update your own notes');
        }

        note.content = content.trim();
        note.timestamp = new Date();

        const updatedNote = await note.save();

        return {
            id: updatedNote._id.toString(),
            courseId: updatedNote.courseId.toString(),
            moduleIndex: updatedNote.moduleIndex,
            resourceId: updatedNote.resourceId,
            content: updatedNote.content,
            timestamp: updatedNote.timestamp
        } as any;
    }
}
