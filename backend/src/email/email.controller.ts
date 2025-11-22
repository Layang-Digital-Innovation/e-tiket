// backend/src/email/email.controller.ts
import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { EmailQueueService } from './email-queue.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { SendEmailDto } from './dto/send-email.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('email')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmailController {
  constructor(private readonly emailQueueService: EmailQueueService) {}

  @Post('send')

  @Roles(UserRole.ADMIN, UserRole.EVENT_ORGANIZER) // Only admin can send emails manually
  @HttpCode(HttpStatus.ACCEPTED)
  async sendEmail(@Body() sendEmailDto: SendEmailDto) {
    const { type, data } = sendEmailDto;

    switch (type) {
      case 'webinar':
        await this.emailQueueService.addWebinarAccessEmail(data);
        break;
      default:
        throw new Error(`Unsupported email type: ${type}`);
    }

    return { 
      success: true,
      message: 'Email has been queued for sending',
      type,
      to: data.to 
    };
  }
}