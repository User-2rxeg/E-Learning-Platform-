import { IsString, IsEmail, IsEnum, IsOptional, IsArray } from 'class-validator';
import { UserRole } from '../Database/User';

export class CreateUserDto {
    @IsString()
    name!: string;

    @IsEmail()
    email!: string;

    @IsString()
    password!: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;

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
    profileImage?: string;
}