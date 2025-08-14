import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsMongoId, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class ResourceDto {
    @IsEnum(['video', 'pdf', 'link'])
    resourceType!: 'video' | 'pdf' | 'link';

    @IsString()
    url!: string;
}

export class ModuleDto {
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
    status?: 'active' | 'archived' | 'draft';

    @IsBoolean()
    @IsOptional()
    certificateAvailable?: boolean;
}

export class UpdateCourseDto extends CourseDTO {
    @IsMongoId()
    @IsOptional()
    instructorId !: string;
}

import { PartialType } from '@nestjs/mapped-types';


//export class UpdateCourseDto extends PartialType(CreateCourseDto) {}



export class SearchCourseDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    instructorName?: string;

    @IsOptional()
    @IsString()
    tag?: string;
}

