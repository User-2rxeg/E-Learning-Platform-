import { Type } from "class-transformer";
import {IsArray, IsBoolean, IsEnum, IsMongoId, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

class ResourceDto {
    @IsEnum(['video', 'pdf', 'link'])
    resourceType!: string;

    @IsString()
    url!: string;
}

class ModuleDto {
    @IsString()
    title!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ResourceDto)
    resources!: ResourceDto[];

    @IsArray()
    @IsMongoId({ each: true })
    @IsOptional()
    quizzes?: string[];

    @IsBoolean()
    @IsOptional()
    notesEnabled?: boolean;
}

export class FeedbackDto {
    @IsNumber()
    rating!: number;

    @IsString()
    @IsOptional()
    comment?: string;
}

export class CourseDTO {
    @IsString()
    title!: string;

    @IsString()
    description!: string;

    @IsMongoId()
    instructorId!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ModuleDto)
    @IsOptional()
    modules?: ModuleDto[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @IsEnum(['active', 'archived', 'draft'])
    @IsOptional()
    status?: string;

    @IsBoolean()
    @IsOptional()
    certificateAvailable?: boolean;
}

export class UpdateCourseDto extends CourseDTO {}