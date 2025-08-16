import { IsString, IsMongoId, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class PostDto {
    @IsString()
    content!: string;

    @IsMongoId()
    author!: string;
}

class ThreadDto {
    @IsString()
    title!: string;

    @IsMongoId()
    createdBy!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PostDto)
    posts!: PostDto[];
}

export class CreateForumDto {
    @IsMongoId()
    courseId!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ThreadDto)
    @IsOptional()
    threads?: ThreadDto[];
}

export class UpdateForumDto extends CreateForumDto {}
