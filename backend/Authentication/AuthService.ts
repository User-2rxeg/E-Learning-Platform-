// src/auth/auth.service.ts
import {
    Injectable,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../User/User.Service';
import {User, UserDocument} from '../Database/User';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlacklistedToken, BlacklistedTokenDocument } from '../Database/BlacklistedToken';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        @InjectModel('BlacklistedToken') private readonly blacklistModel: Model<BlacklistedTokenDocument>,
    ) {}

    // src/auth/auth.service.ts

    async register(registerDto: any): Promise<any> {
        const existingUser = await this.userService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new UnauthorizedException('Email already in use');
        }

        // Reuse the UserService to create the user
        return this.userService.create(registerDto);
    }


    async validateUser(email: string, plainPassword: string): Promise<any> {
        const user = await this.userService.findByEmail(email);
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const passwordMatches = await bcrypt.compare(plainPassword, user.password);
        if (!passwordMatches) throw new UnauthorizedException('Invalid credentials');

        const { password, ...result } = (user as UserDocument).toObject();
        return result;
    }

    async login(email: string, plainPassword: string): Promise<{ access_token: string; refresh_token: string; user: any }> {
        const user = await this.validateUser(email, plainPassword);

        const payload = {
            sub: user._id,
            email: user.email,
            role: user.role,
        };

        const access_token = await this.jwtService.signAsync(payload, {
            expiresIn: '1h',
        });

        const refresh_token = await this.jwtService.signAsync(payload, {
            expiresIn: '7d',
        });

        return {
            access_token,
            refresh_token,
            user,
        };
    }

    async logout(token: string): Promise<void> {
        const decoded = this.jwtService.decode(token);

        if (!decoded || typeof decoded !== 'object' || !decoded.sub) {
            throw new ForbiddenException('Invalid token');
        }

        await this.blacklistModel.create({
            token,
            expiresAt: new Date((decoded.exp as number) * 1000),
        });
    }

    async refreshToken(refresh_token: string): Promise<{ access_token: string; refresh_token: string }> {
        try {
            const decoded = await this.jwtService.verifyAsync(refresh_token);
            const payload = {
                sub: decoded.sub,
                email: decoded.email,
                role: decoded.role,
            };

            const access_token = await this.jwtService.signAsync(payload, {
                expiresIn: '1h',
            });

            const new_refresh_token = await this.jwtService.signAsync(payload, {
                expiresIn: '7d',
            });

            return {
                access_token,
                refresh_token: new_refresh_token,
            };
        } catch (err) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
        const blacklisted = await this.blacklistModel.findOne({ token }).exec();
        return !!blacklisted;
    }
    async getUserProfile(userId: string): Promise<User | null> {
        return this.userService.findById(userId);
    }

}
