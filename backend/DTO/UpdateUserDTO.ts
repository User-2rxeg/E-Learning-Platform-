import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './CreateUserDTO';

export class UpdateUserDTO extends PartialType(CreateUserDto) {}
import {IsOptional, IsString, IsArray, IsEmail} from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsArray()
    learningPreferences?: string[];

    @IsOptional()
    @IsArray()
    subjectsOfInterest?: string[];

    @IsOptional()
    @IsArray()
    expertise?: string[];

    @IsOptional()
    @IsString()
    profileImage?: string;
}

// src/DTO/UpdateUserRoleDTO.ts
import { IsEnum } from 'class-validator';
import { UserRole } from '../Database/User';

export class UpdateUserRoleDto {
    @IsString()
    userId!: string;

    @IsEnum(UserRole)
    newRole!: UserRole;
}
