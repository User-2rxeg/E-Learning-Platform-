import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../database/user';
import { RateLimitGuard } from './rate-limit.guard';
import { AccountLockoutService } from './account-lockout.service';
import { SanitizeInputPipe } from './input-sanitization.pipe';
import { AuditLogModule } from '../audit-log/audit-logging.module';

@Global()
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
        ]),
        AuditLogModule,
    ],
    providers: [
        RateLimitGuard,
        AccountLockoutService,
        SanitizeInputPipe,
    ],
    exports: [
        RateLimitGuard,
        AccountLockoutService,
        SanitizeInputPipe,
    ],
})
export class SecurityModule {}

