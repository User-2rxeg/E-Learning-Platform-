import { IsString, IsEmail, IsEnum, IsOptional, IsArray } from 'class-validator';
import { UserRole } from '../database/user';

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



export class UpdateUserRoleDto {
    @IsString()
    userId!: string;

    @IsEnum(UserRole)
    newRole!: UserRole;
}
