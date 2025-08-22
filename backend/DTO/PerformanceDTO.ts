import { IsNumber, IsArray, IsMongoId, IsOptional, ValidateNested, IsDate, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class ScoreDto {
    @IsMongoId()
    @IsOptional()
    moduleId?: string;

    @IsMongoId()
    @IsOptional()
    quizId?: string;

    @IsNumber()
    score!: number;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    completedAt?: Date;
}

class EngagementLogDto {
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    timestamp?: Date;

    @IsNumber()
    duration!: number;

    @IsString()
    activity!: string;
}

export class CreatePerformanceDto {
    @IsMongoId()
    studentId!: string;

    @IsMongoId()
    courseId!: string;

    @IsNumber()
    @IsOptional()
    progress?: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ScoreDto)
    @IsOptional()
    scores?: ScoreDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EngagementLogDto)
    @IsOptional()
    engagementLog?: EngagementLogDto[];
}

import { PartialType } from '@nestjs/mapped-types';

export class UpdatePerformanceDto extends PartialType(CreatePerformanceDto) {}