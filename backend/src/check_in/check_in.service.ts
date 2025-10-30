import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TicketService } from 'src/ticket/ticket.service';
import { WristbandService } from 'src/wristband/wristband.service';
import { TicketStatus } from 'src/ticket/entities/ticket.entity';
import { WristbandStatus } from 'src/wristband/entities/wristband.entity';
import { CheckInDto } from './dto/check_in.dto';

@Injectable()
export class CheckInService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly ticketService: TicketService,
    private readonly wristbandService: WristbandService,
  ) {}

  /**
   * Check-in berdasarkan kode gelang (wristbandCode)
   */
  async checkInByWristband(checkInDto: CheckInDto) {
    return this.dataSource.transaction(async (manager) => {
      // 1️⃣ Cari gelang berdasarkan kode
      const wristband = await this.wristbandService.findOneByCode(checkInDto.wristbandCode, manager);

      if (!wristband.assignedTicket) {
        throw new BadRequestException('Wristband not assigned to any ticket');
      }

      if (wristband.status === WristbandStatus.CHECKED_IN) {
        throw new BadRequestException('Wristband already checked in');
      }

      // 2️⃣ Ambil tiket yang terkait
      const ticket = await this.ticketService.findOneByCode(wristband.assignedTicket.ticketCode as string, manager);
      if (!ticket) throw new NotFoundException('Linked ticket not found');

      if (ticket.status === TicketStatus.CHECKED_IN) {
        throw new BadRequestException('Ticket already checked in');
      }

      // 3️⃣ Update status keduanya
      const now = new Date();

      wristband.status = WristbandStatus.CHECKED_IN;
      wristband.checkedInAt = now;

      ticket.status = TicketStatus.CHECKED_IN;

      // 4️⃣ Simpan perubahan via EntityManager (agar satu transaksi)
      await this.wristbandService.saveChange(wristband, manager);
      await this.ticketService.saveChange(ticket, manager);

      return {
        message: 'Check-in successful',
        wristbandCode: wristband.wristbandCode,
        ticketCode: ticket.ticketCode,
        checkedInAt: now,
      };
    });
  }

  async findAllAssignedWristband() {
    return this.wristbandService.findAssignedWristband();
  }

  async findAllCheckInList() {
    return this.wristbandService.findAllCheckInList();
  }

  async findCheckedInWristbandByEventId(eventId: string) {
    return this.wristbandService.findCheckedInWristbandByEventId(eventId);
  }

  async findAllCheckInListByEvent(eventId: string) {
    return this.wristbandService.findCheckedInWristbandByEventId(eventId);
  }

  /**
   * Get wristband with event and organizer info for authorization check
   */
  async getWristbandWithEvent(wristbandCode: string) {
    return this.wristbandService.findOneByCodeWithEventAndOrganizer(wristbandCode);
  }
}
