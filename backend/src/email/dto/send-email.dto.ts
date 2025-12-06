// backend/src/email/dto/send-email.dto.ts
import { IsString, IsNotEmpty, IsEmail, IsOptional, IsIn } from 'class-validator';

interface WebinarEmailData {
    to: string;
    attendeeName: string;
    eventTitle: string;
    startAt: Date;
    endAt: Date;
    webinarJoinUrl: string;
}

export class SendEmailDto {
    @IsString()
    @IsIn(['ticket', 'order', 'verification', 'password-reset', 'webinar'])
    type: string;

    @IsNotEmpty()
    data: WebinarEmailData;
}