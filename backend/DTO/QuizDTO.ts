// QuizDto.ts
import { IsString, IsBoolean, IsArray, IsMongoId, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class QuestionDto {
    @IsString()
    questionText!: string;

    @IsArray()
    @IsString({ each: true })
    choices!: string[];

    @IsString()
    correctAnswer!: string;

    @IsEnum(['easy', 'medium', 'hard'])
    @IsOptional()
    difficulty?: string;
}

export class CreateQuizDto {
    @IsMongoId()
    moduleId!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionDto)
    questions!: QuestionDto[];

    @IsBoolean()
    @IsOptional()
    adaptive?: boolean;

    @IsMongoId()
    createdBy!: string;
}



class AttemptAnswerDto {
    //@IsMongoId()
    @IsString()
    questionId!: string;

    @IsString()
    selectedAnswer!: string;
}

export class AttemptQuizDto {
    @IsMongoId()
    quizId!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AttemptAnswerDto)
    responses!: AttemptAnswerDto[];
}


export class UpdateQuizDto extends CreateQuizDto {}
