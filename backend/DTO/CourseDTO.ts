// CourseDto.ts
import { IsString, IsBoolean, IsArray, IsMongoId, IsEnum, IsOptional, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

// Compatibility wrappers
const CompatIsString: any = IsString;
const CompatIsBoolean: any = IsBoolean;
const CompatIsArray: any = IsArray;
const CompatIsMongoId: any = IsMongoId;
const CompatIsEnum: any = IsEnum;
const CompatIsOptional: any = IsOptional;
const CompatValidateNested: any = ValidateNested;
const CompatIsNumber: any = IsNumber;
const CompatType: any = Type;

class ResourceDto {
    @CompatIsEnum(['video', 'pdf', 'link'])
    resourceType: string;

    @CompatIsString()
    url: string;
}

class ModuleDto {
    @CompatIsString()
    title: string;

    @CompatIsArray()
    @CompatValidateNested({ each: true })
    @CompatType(() => ResourceDto)
    resources: ResourceDto[];

    @CompatIsArray()
    @CompatIsMongoId({ each: true })
    @CompatIsOptional()
    quizzes?: string[];

    @CompatIsBoolean()
    @CompatIsOptional()
    notesEnabled?: boolean;
}

class FeedbackDto {
    @CompatIsNumber()
    rating: number;

    @CompatIsString()
    @CompatIsOptional()
    comment?: string;
}

export class CourseDTO {
    @CompatIsString()
    title: string;

    @CompatIsString()
    description: string;

    @CompatIsMongoId()
    instructorId: string;

    @CompatIsArray()
    @CompatValidateNested({ each: true })
    @CompatType(() => ModuleDto)
    @CompatIsOptional()
    modules?: ModuleDto[];

    @CompatIsArray()
    @CompatIsString({ each: true })
    @CompatIsOptional()
    tags?: string[];

    @CompatIsEnum(['active', 'archived', 'draft'])
    @CompatIsOptional()
    status?: string;

    @CompatIsBoolean()
    @CompatIsOptional()
    certificateAvailable?: boolean;
}

export class UpdateCourseDto extends CourseDTO {}