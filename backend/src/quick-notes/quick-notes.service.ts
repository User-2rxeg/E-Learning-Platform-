import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { QuickNote } from "../database/quick-notes";



@Injectable()
export class QuickNotesService {
    constructor(
        @InjectModel('QuickNote') private readonly quickNoteModel: Model<QuickNote>
    ) {}

    async createNote(studentId: string, noteData: {
        courseId: string;
        moduleIndex: number;
        content: string;
        resourceId?: string;
        timestamp?: Date;
    }): Promise<any> {
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

        const savedNote: any = await note.save();

        return {
            id: savedNote._id.toString(),
            courseId: noteData.courseId,
            moduleIndex: noteData.moduleIndex,
            resourceId: noteData.resourceId,
            content: noteData.content,
            timestamp: savedNote.timestamp
        };
    }

    async getNotesByCourse(studentId: string, courseId: string): Promise<any[]> {
        if (!Types.ObjectId.isValid(studentId) || !Types.ObjectId.isValid(courseId)) {
            throw new BadRequestException('Invalid IDs');
        }

        const notes: any[] = await this.quickNoteModel
            .find({
                studentId: new Types.ObjectId(studentId),
                courseId: new Types.ObjectId(courseId)
            })
            .sort({ createdAt: -1 })
            .lean();

        return notes.map(note => ({
            id: note._id.toString(),
            courseId: courseId,
            moduleIndex: note.moduleIndex,
            resourceId: note.resourceId,
            content: note.content,
            timestamp: note.timestamp
        }));
    }

    async deleteNote(studentId: string, noteId: string): Promise<void> {
        if (!Types.ObjectId.isValid(studentId) || !Types.ObjectId.isValid(noteId)) {
            throw new BadRequestException('Invalid IDs');
        }

        const note: any = await this.quickNoteModel.findById(noteId).lean();
        if (!note) {
            throw new NotFoundException('Note not found');
        }

        // Ensure the note belongs to the requesting student
        if (String(note.studentId) !== studentId) {
            throw new ForbiddenException('You can only delete your own notes');
        }

        await this.quickNoteModel.findByIdAndDelete(noteId);
    }

    async updateNote(studentId: string, noteId: string, content: string): Promise<any> {
        if (!Types.ObjectId.isValid(studentId) || !Types.ObjectId.isValid(noteId)) {
            throw new BadRequestException('Invalid IDs');
        }

        const note: any = await this.quickNoteModel.findById(noteId).lean();
        if (!note) {
            throw new NotFoundException('Note not found');
        }

        // Ensure the note belongs to the requesting student
        if (String(note.studentId) !== studentId) {
            throw new ForbiddenException('You can only update your own notes');
        }

        const updated: any = await this.quickNoteModel.findByIdAndUpdate(
            noteId,
            { content: content.trim(), updatedAt: new Date() },
            { new: true }
        ).lean();

        return {
            id: updated._id.toString(),
            courseId: String(updated.courseId),
            moduleIndex: updated.moduleIndex,
            resourceId: updated.resourceId,
            content: updated.content,
            timestamp: updated.timestamp
        };
    }

    async getAllNotes(studentId: string): Promise<any[]> {
        if (!Types.ObjectId.isValid(studentId)) {
            throw new BadRequestException('Invalid student ID');
        }

        const notes: any[] = await this.quickNoteModel
            .find({ studentId: new Types.ObjectId(studentId) })
            .sort({ createdAt: -1 })
            .lean();

        return notes.map(note => ({
            id: note._id.toString(),
            courseId: String(note.courseId),
            moduleIndex: note.moduleIndex,
            resourceId: note.resourceId,
            content: note.content,
            timestamp: note.timestamp
        }));
    }
}
