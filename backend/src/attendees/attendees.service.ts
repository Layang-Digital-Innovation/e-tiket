import { Injectable, Logger } from '@nestjs/common';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendee } from './entities/attendee.entity';
import { Repository, In } from 'typeorm';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { TicketService } from 'src/ticket/ticket.service';

@Injectable()
export class AttendeesService {

   constructor(
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
    private readonly ticketService: TicketService
  ) {}
  create(createAttendeeDto: CreateAttendeeDto) {
    return this.attendeeRepository.save(createAttendeeDto);
  }



  findAll() {
    return `This action returns all attendees`;
  }

  findOne(id: number) {
    return `This action returns a #${id} attendee`;
  }

  update(id: number, updateAttendeeDto: UpdateAttendeeDto) {
    return `This action updates a #${id} attendee`;
  }

  remove(id: number) {
    return `This action removes a #${id} attendee`;
  }

  async findByEventSlug(eventSlug: string, status?: string) {
    try {
     const tickets = await this.ticketService.findTicketsByEventSlug(eventSlug, status);

     Logger.debug("TIKET", tickets);

     const attendees = await this.attendeeRepository.find({
      where: {
        ticket: {
          id: In(tickets.map(t => t.id))
        }
      },
      relations: ['ticket', 'orderItem']
    });

    Logger.debug("ATTENDEES", attendees);

    Logger.debug(`Found ${attendees.length} attendees for event slug: ${eventSlug}`);
    return attendees;
    } catch (error) {
      Logger.error(`Error finding attendees for event slug ${eventSlug}:`, error);
      throw error;
    }
  }

  // Backward compatibility method
  async findByEvent(eventId: string, status?: string) {
    Logger.warn('findByEvent is deprecated, use findByEventSlug instead');
    return this.findByEventSlug(eventId, status);
  }

  async exportCsvByEventSlug(eventSlug: string, status?: string) {
    try {
      Logger.debug(`=== EXPORT CSV DEBUG ===`);
      Logger.debug(`Export request for slug: ${eventSlug}, status: ${status}`);
      
      const data = await this.findByEventSlug(eventSlug, status);
      Logger.debug(`Found ${data.length} attendees for export`);
      
      if (data.length === 0) {
        Logger.warn(`No attendees found for export - slug: ${eventSlug}`);
        // Return empty CSV with headers only
        const headers = ['No', 'Nama', 'Email', 'Telepon', 'TicketCode', 'Status'];
        return '\uFEFF' + headers.join(',') + '\n';
      }

      // Log sample data structure for debugging
      Logger.debug('Sample attendee data:', {
        id: data[0].id,
        fullName: data[0].fullName,
        email: data[0].email,
        hasTicket: !!data[0].ticket,
        ticketCode: data[0].ticket?.ticketCode,
        ticketStatus: data[0].ticket?.status,
        ticketId: data[0].ticket?.id
      });

      const headers = ['No', 'Nama', 'Email', 'Telepon', 'TicketCode', 'Status'];
      const rows = data.map((a, idx) => {
        const ticketCode = a.ticket?.ticketCode ?? 'N/A';
        const st = a.ticket?.status ?? 'N/A';
        return [
          String(idx + 1),
          a.fullName ?? 'N/A',
          a.email ?? 'N/A',
          a.phoneNumber ?? 'N/A',
          ticketCode,
          st,
        ];
      });

      const escape = (s: string) => '"' + (s?.replace(/"/g, '""') ?? '') + '"';
      const csv = [
        '\uFEFF' + headers.join(','),
        ...rows.map((r) => r.map(escape).join(',')),
      ].join('\n');
      
      Logger.debug(`Successfully exported ${data.length} attendees to CSV for event slug: ${eventSlug}`);
      Logger.debug(`CSV length: ${csv.length} characters`);
      return csv;
    } catch (error) {
      Logger.error(`Error exporting attendees for event slug ${eventSlug}:`, error);
      throw error;
    }
  }

  // Backward compatibility method
  async exportCsvByEvent(eventId: string, status?: string) {
    try {
      const data = await this.findByEvent(eventId, status);
      const headers = ['No', 'Nama', 'Email', 'Telepon', 'TicketCode', 'Status'];
      const rows = data.map((a, idx) => {
        const ticketCode = a.ticket?.ticketCode ?? '';
        const st = a.ticket?.status ?? '';
        return [
          String(idx + 1),
          a.fullName ?? '',
          a.email ?? '',
          a.phoneNumber ?? '',
          ticketCode,
          st,
        ];
      });

      const escape = (s: string) => '"' + (s?.replace(/"/g, '""') ?? '') + '"';
      const csv = [
        '\uFEFF' + headers.join(','),
        ...rows.map((r) => r.map(escape).join(',')),
      ].join('\n');
      
      Logger.debug(`Exported ${data.length} attendees to CSV for event ${eventId}`);
      return csv;
    } catch (error) {
      Logger.error(`Error exporting attendees for event ${eventId}:`, error);
      throw error;
    }
  }
}
