// src/user/user.controller.ts

import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { UserService } from './User.Service';
import { CreateUserDto } from '../DTO/CreateUserDTO';
import { JwtAuthGuard } from '../Authentication/Guards/AuthGuard';
import { Public } from '../Authentication/Decorators/PublicDecorator';
import {RolesGuard} from "../Authentication/Guards/RolesGuard";
import {Roles} from "../Authentication/Decorators/RolesDecorator";
import {UserRole} from "../Database/User";


@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    // Public route: Register a new user
   // @Public()
    //@Post('register')
    //async register(@Body() createUserDto: CreateUserDto) {
     //   return this.userService.create(createUserDto);
    //}

    // Protected route: Get user by ID
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getUser(@Param('id') id: string) {
        return this.userService.findById(id);
    }

   
}
