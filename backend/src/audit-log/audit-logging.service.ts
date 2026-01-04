import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Logs } from "./Logs";
import { CreateAuditLogDto, UpdateAuditLogDto } from "../dto's/audit-logging-dtos's";
import { AuditLog } from "../database/audit-log";


@Injectable()
export class AuditLogService {
    constructor(
        @InjectModel(AuditLog.name)
        private readonly auditModel: Model<AuditLog>,
    ) {}


    async log(event: Logs, userId?: string | Types.ObjectId, details?: Record<string, any>) {
        return this.auditModel.create({
            event,
            userId: userId ? new Types.ObjectId(String(userId)) : undefined,
            details: details ?? {},
            timestamp: new Date()
        });
    }

    async record(event: Logs, userId?: string, details?: Record<string, any>) {
        return this.log(event, userId, details);
    }


    async create(dto: CreateAuditLogDto) {
        return this.auditModel.create({
            event: dto.event,
            userId: dto.userId ? new Types.ObjectId(dto.userId) : undefined,
            details: dto.details ?? {},
            timestamp: dto.timestamp ?? new Date(),
        });
    }



    async findAll(
        page = 1,
        limit = 20,
        filters?: { userId?: string; event?: string; from?: string; to?: string },
    ) {
        const skip = (page - 1) * limit;
        const query: FilterQuery<AuditLog> = {};


        if (filters?.userId) query.userId = new Types.ObjectId(filters.userId);
        if (filters?.event) query.event = filters.event;
        if (filters?.from || filters?.to) {
            query.timestamp = {};
            if (filters.from) query.timestamp.$gte = new Date(filters.from);
            if (filters.to) query.timestamp.$lte = new Date(filters.to);
        }

        // Execute queries separately to avoid complex union type
        const items: any[] = await this.auditModel
            .find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total: number = await this.auditModel.countDocuments(query);

        return { items, total, page, limit };
    }

    async findByEvent(event: Logs, page = 1, limit = 20, from?: string, to?: string) {
        return this.findAll(page, limit, { event, from, to });
    }

    async findByUser(userId: string, page = 1, limit = 20, from?: string, to?: string) {
        return this.findAll(page, limit, { userId, from, to });
    }

    async findOne(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid id');
        }
        const doc: any = await this.auditModel.findById(id).lean();
        if (!doc) throw new NotFoundException('Audit log not found');
        return doc;
    }


    async update(id: string, dto: UpdateAuditLogDto) {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid id');
        }
        const doc = await this.auditModel.findByIdAndUpdate(id, dto, { new: true }).lean();
        //const doc = await this.auditModel
        if (!doc) throw new NotFoundException('Audit log not found');
        return doc;
    }

    async delete(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid id');
        }
        const res = await this.auditModel.findByIdAndDelete(id);
        if (!res) throw new NotFoundException('Audit log not found');
        return { deleted: true };
    }

    async purgeOlderThan(days: number) {
        if (!Number.isInteger(days) || days < 0) {
            throw new BadRequestException('Invalid days. Days must be > 0');
        }
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const result = await this.auditModel.deleteMany({ timestamp: { $lt: cutoff } });
        return { deletedCount: result.deletedCount };
    }
}
