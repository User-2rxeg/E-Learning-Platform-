import { IsString, IsEmail, IsEnum, IsOptional, IsArray } from 'class-validator';
import { UserRole } from '../Database/User';

// Create compatibility wrappers for class-validator decorators
const CompatIsString: any = IsString;
const CompatIsEmail: any = IsEmail;
const CompatIsEnum: any = IsEnum;
const CompatIsOptional: any = IsOptional;
const CompatIsArray: any = IsArray;

export class CreateUserDto {
    @CompatIsString()
    name: string;

    @CompatIsEmail()
    email: string;

    @CompatIsString()
    password: string;

    @CompatIsEnum(UserRole)
    @CompatIsOptional()
    role?: UserRole;

    @CompatIsOptional()
    @CompatIsArray()
    learningPreferences?: string[];

    @CompatIsOptional()
    @CompatIsArray()
    subjectsOfInterest?: string[];

    @CompatIsOptional()
    @CompatIsArray()
    expertise?: string[];

    @CompatIsOptional()
    profileImage?: string;
}