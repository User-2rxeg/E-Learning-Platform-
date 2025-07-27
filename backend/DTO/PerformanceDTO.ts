// PerformanceDto.ts
import { IsNumber, IsArray, IsMongoId, IsOptional, ValidateNested, IsDate, IsString } from 'class-validator';
import { Type } from 'class-transformer';

// Compatibility wrappers
const CompatIsNumber: any = IsNumber;
const CompatIsArray: any = IsArray;
const CompatIsMongoId: any = IsMongoId;
const CompatIsOptional: any = IsOptional;
const CompatValidateNested: any = ValidateNested;
const CompatIsDate: any = IsDate;
const CompatIsString: any = IsString;
const CompatType: any = Type;

class ScoreDto {
    @CompatIsMongoId()
    @CompatIsOptional()
    moduleId?: string;

    @CompatIsMongoId()
    @CompatIsOptional()
    quizId?: string;

    @CompatIsNumber()
    score: number;
}

class EngagementLogDto {
    @CompatIsDate()
    @CompatIsOptional()
    timestamp?: Date;

    @CompatIsNumber()
    duration: number;

    @CompatIsString()
    activity: string;
}

export class CreatePerformanceDto {
    @CompatIsMongoId()
    studentId: string;

    @CompatIsMongoId()
    courseId: string;

    @CompatIsNumber()
    @CompatIsOptional()
    progress?: number;

    @CompatIsArray()
    @CompatValidateNested({ each: true })
    @CompatType(() => ScoreDto)
    @CompatIsOptional()
    scores?: ScoreDto[];

    @CompatIsArray()
    @CompatValidateNested({ each: true })
    @CompatType(() => EngagementLogDto)
    @CompatIsOptional()
    engagementLog?: EngagementLogDto[];
}

export class UpdatePerformanceDto extends CreatePerformanceDto {}