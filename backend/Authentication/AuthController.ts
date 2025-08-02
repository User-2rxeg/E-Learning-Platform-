import {
    Controller,
    Post,
    Body,
    Get,
    HttpCode,
    HttpStatus,
    Request,
    UseGuards, InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './AuthService';
import { JwtAuthGuard } from './Guards/AuthGuard';
import { LoginDto } from './AuthDTO/LoginDTO';
import { Request as ExpressRequest } from 'express';
import {CurrentUser} from "./Decorators/CurrentUser";
import {JwtPayload} from "./Interfaces/JWTPayload.Interface";
import {RegisterDto} from "./AuthDTO/RegisterDTO";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        try {
            return await this.authService.register(registerDto);
        } catch (error) {
            console.error('Register error:', error);
            throw new InternalServerErrorException('Something went wrong during registration.');
        }
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto.email, loginDto.password);
    }

    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    async refresh(@Body('refreshToken') refreshToken: string) {
        return this.authService.refreshToken(refreshToken);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('logout')
    async logout(@Request() req: ExpressRequest) {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];

        if (token) {
            await this.authService.logout(token);
        }

        return { message: 'Logout successful' };
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@CurrentUser() user: JwtPayload) {
        const fullUser = await this.authService.getUserProfile(user.sub);
        return fullUser;
    }

}
