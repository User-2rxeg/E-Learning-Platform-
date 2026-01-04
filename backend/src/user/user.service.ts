import {InjectModel} from "@nestjs/mongoose";
import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";

import {Model, Types} from "mongoose";
import * as bcrypt from 'bcrypt';
import {CreateUserDto, UpdateUserDto} from "../dto's/user-dtos's";
import {User, UserDocument, UserRole} from "../database/user";


type PageOpts = { page?: number; limit?: number };

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
    }

    private normalizeEmail(email: string) {
        return email.trim().toLowerCase();
    }

    private toPublic(doc: any) {
        const o = doc.toObject ? doc.toObject() : doc;
        delete o.passwordHash;
        return o;
    }


    async create(createUserDto: CreateUserDto) {
        const existingUser = await this.userModel.findOne({email: createUserDto.email});

        if (existingUser) {
            throw new BadRequestException('Email is already registered');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const createdUser = new this.userModel({
            ...createUserDto,
            passwordHash: hashedPassword,
            role: createUserDto.role || UserRole.STUDENT,
            isEmailVerified: false,
            otpCode: null,
            otpExpiresAt: null,
        });

        return createdUser.save();
    }

    async updateUserInternal(userId: string, updateData: any) {
        if (!userId || !Types.ObjectId.isValid(userId)) {
            throw new BadRequestException('Invalid user ID');
        }
        if (updateData.email) {
            updateData.email = this.normalizeEmail(updateData.email);
        }

        const updatedUser = await this.userModel.findByIdAndUpdate(
            userId,
            {$set: updateData},
            {new: true, runValidators: true}
        );

        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }
        return updatedUser;
    }

    async findByEmail(email: string) {
        return this.userModel.findOne({email: this.normalizeEmail(email)});
    }


    async findByEmailWithHash(email: string) {
        return this.userModel.findOne({email: this.normalizeEmail(email)}).select('+passwordHash');
    }

    async findById(id: string) {
        const user = await this.userModel.findById(id);
        if (!user) throw new NotFoundException('User not found');
        return this.toPublic(user);
    }

    async findByName(name: string) {
        const user = await this.userModel.findOne({name});
        if (!user) throw new NotFoundException('User not found');
        return this.toPublic(user);
    }

    async getUserProfile(userId: string) {
        return this.userModel.findById(userId);
    }

    async updateUser(userId: string, updateData: UpdateUserDto) {
        if (updateData.email) updateData.email = this.normalizeEmail(updateData.email);
        const updatedUser = await this.userModel.findByIdAndUpdate(userId, updateData, {new: true});
        if (!updatedUser) throw new NotFoundException('User not found');
        return this.toPublic(updatedUser);
    }


    async updateUserRole(userId: string, newRole: UserRole) {
        const updatedUser = await this.userModel.findByIdAndUpdate(userId, {role: newRole}, {new: true});
        if (!updatedUser) throw new NotFoundException('User not found');
        return this.toPublic(updatedUser);
    }


    async deleteUser(userId: string) {
        await this.userModel.findByIdAndDelete(userId);
    }

    async getAllUsers() {
        return this.userModel.find();
    }

    async findByIdSelectSecret(id: string) {
        return this.userModel.findById(id).select('+mfaSecret +mfaBackupCodes');
    }


    private clampLimit(limit: number) {
        if (!Number.isFinite(limit) || limit <= 0) return 20;
        return Math.min(limit, 100);
    }

    async paginate(filter: Record<string, any>, {page = 1, limit = 20}: PageOpts) {
        const _limit = this.clampLimit(limit);
        const _page = Math.max(1, Number(page) || 1);
        const skip = (_page - 1) * _limit;

        const docs = await this.userModel
            .find(filter)
            .select('-mfaSecret -mfaBackupCodes')
            .sort({createdAt: -1})
            .skip(skip)
            .limit(_limit);

        const items = docs.map(d => (typeof d.toObject === 'function' ? d.toObject() : d));
        const total = await this.userModel.countDocuments(filter);

        return {items, total, page: _page, pages: Math.ceil(total / _limit), limit: _limit};
    }


    async searchUsers(params: {
        q?: string;
        role?: UserRole;
        page?: number;
        limit?: number;
    }) {
        const {q, role, page = 1, limit = 20} = params;
        const filter: any = {};

        if (role) filter.role = role;

        if (q && q.trim()) {
            const term = q.trim();
            filter.$or = [
                {name: {$regex: term, $options: 'i'}},
                {email: {$regex: term, $options: 'i'}},
            ];
        }

        return this.paginate(filter, {page, limit});
    }

}