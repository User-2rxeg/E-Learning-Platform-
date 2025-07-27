import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './CreateUserDTO';

export class UpdateUserDTO extends PartialType(CreateUserDto) {}
