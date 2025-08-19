// src/mail/mail.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import {Public} from "../Authentication/Decorators/Public-Decorator";

@Controller('mail')
export class MailController {
    constructor(private readonly mailService: MailService) {}
    @Public()
    @Post('test')
    async testEmail(@Body() body: { email: string }) {
        const result = await this.mailService.sendPasswordResetEmail(
            body.email,
            'test-token-12345'
        );
        return { success: true, messageUrl: result };
    }
}
