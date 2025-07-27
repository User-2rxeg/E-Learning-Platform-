// QuizDto.ts
import { IsString, IsBoolean, IsArray, IsMongoId, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Compatibility wrappers
const CompatIsString: any = IsString;
const CompatIsBoolean: any = IsBoolean;
const CompatIsArray: any = IsArray;
const CompatIsMongoId: any = IsMongoId;
const CompatIsEnum: any = IsEnum;
const CompatIsOptional: any = IsOptional;
const CompatValidateNested: any = ValidateNested;
const CompatType: any = Type;

class QuestionDto {
    @CompatIsString()
    questionText: string;

    @CompatIsArray()
    @CompatIsString({ each: true })
    choices: string[];

    @CompatIsString()
    correctAnswer: string;

    @CompatIsEnum(['easy', 'medium', 'hard'])
    @CompatIsOptional()
    difficulty?: string;
}

export class CreateQuizDto {
    @CompatIsMongoId()
    moduleId: string;

    @CompatIsArray()
    @CompatValidateNested({ each: true })
    @CompatType(() => QuestionDto)
    questions: QuestionDto[];

    @CompatIsBoolean()
    @CompatIsOptional()
    adaptive?: boolean;

    @CompatIsMongoId()
    createdBy: string;
}

export class UpdateQuizDto extends CreateQuizDto {}