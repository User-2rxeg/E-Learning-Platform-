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

export class CoursesDtosS {
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

// Alias for backward compatibility
export { CoursesDtosS as CourseDTO };

export class UpdateCourseDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsMongoId()
    @IsOptional()
    instructorId?: string;

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

