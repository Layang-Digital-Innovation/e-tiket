import { IsEnum, IsOptional } from 'class-validator';
import { TicketStatus } from '../entities/ticket.entity';

export class UpdateTicketDto {
    @IsOptional()
    @IsEnum(TicketStatus)
    status?: TicketStatus;
}
