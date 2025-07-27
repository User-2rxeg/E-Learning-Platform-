// ForumDto.ts
import { IsString, IsMongoId, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

const CompatIsString: any = IsString;
const CompatIsMongoId: any = IsMongoId;
const CompatIsArray: any = IsArray;
const CompatValidateNested: any = ValidateNested;
const CompatIsOptional: any = IsOptional;
const CompatType: any = Type;

class PostDto {
    @CompatIsString()
    content: string;

    @CompatIsMongoId()
    author: string;
}

class ThreadDto {
    @CompatIsString()
    title: string;

    @CompatIsMongoId()
    createdBy: string;

    @CompatIsArray()
    @CompatValidateNested({ each: true })
    @CompatType(() => PostDto)
    posts: PostDto[];
}

export class CreateForumDto {
    @CompatIsMongoId()
    courseId: string;

    @CompatIsArray()
    @CompatValidateNested({ each: true })
    @CompatType(() => ThreadDto)
    @CompatIsOptional()
    threads?: ThreadDto[];
}

export class UpdateForumDto extends CreateForumDto {}