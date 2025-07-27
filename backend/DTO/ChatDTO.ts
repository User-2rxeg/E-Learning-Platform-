// ChatDto.ts
import { IsString, IsArray, IsMongoId, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Compatibility wrappers
const CompatIsString: any = IsString;
const CompatIsArray: any = IsArray;
const CompatIsMongoId: any = IsMongoId;
const CompatIsOptional: any = IsOptional;
const CompatIsBoolean: any = IsBoolean;
const CompatValidateNested: any = ValidateNested;
const CompatType: any = Type;

class MessageDto {
    @CompatIsMongoId()
    sender: string;

    @CompatIsString()
    content: string;
}

export class CreateChatDto {
    @CompatIsArray()
    @CompatIsMongoId({ each: true })
    participants: string[];

    @CompatIsArray()
    @CompatValidateNested({ each: true })
    @CompatType(() => MessageDto)
    @CompatIsOptional()
    messages?: MessageDto[];

    @CompatIsBoolean()
    @CompatIsOptional()
    isGroup?: boolean;

    @CompatIsString()
    @CompatIsOptional()
    groupName?: string;

    @CompatIsMongoId()
    @CompatIsOptional()
    courseId?: string;
}

export class AddMessageDto {
    @CompatIsMongoId()
    sender: string;

    @CompatIsString()
    content: string;
}

export class UpdateChatDto extends CreateChatDto {}