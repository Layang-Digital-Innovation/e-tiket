import { EventStatus } from '../entities/event.entity';
import { AuditResponseDto } from '../../common/dto/audit.dto';

export class EventResponseDto extends AuditResponseDto {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  maxCapacity: number;
  basePrice: number;
  imageUrl?: string;
  status: EventStatus;
  organizerId: string;
  organizer?: {
    id: string;
    name: string;
    email: string;
  };
  
  // Statistics (optional)
  ticketsSold?: number;
  totalRevenue?: number;
  availableTickets?: number;
}