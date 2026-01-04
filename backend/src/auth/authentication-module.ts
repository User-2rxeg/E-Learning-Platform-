import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from "./email/email-module";
import { BlacklistedToken, BlacklistedTokenSchema } from "./token/blacklisted-token.schema";
import { User, UserSchema } from "../database/user";

import { AuthService } from "./services/authentication-service";
import { AuthController } from "./controller/authentication-controller";
import { AuthorizationGuard } from "./guards/authorization-guard";
import { UserModule } from "../user/user.module";
import { JwtStrategy } from "./token/jwt-strategies";
import { AuthenticationGuard } from "./guards/authentication-guard";
import { AuditLogModule } from "../audit-log/audit-logging.module";

@Module({
    imports: [
        ConfigModule,
        MailModule,
        forwardRef(() => AuditLogModule),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => ({
                secret: cfg.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '7d' as const },
            }),
        }),
        MongooseModule.forFeature([
            { name: BlacklistedToken.name, schema: BlacklistedTokenSchema },
            { name: User.name, schema: UserSchema },
        ]),
        forwardRef(() => UserModule),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, AuthorizationGuard, AuthenticationGuard],
    exports: [AuthService, JwtModule, AuthenticationGuard, AuthorizationGuard],
})
export class AuthModule {}
