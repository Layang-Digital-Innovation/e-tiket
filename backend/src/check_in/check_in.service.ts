import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TicketService } from 'src/ticket/ticket.service';
import { WristbandService } from 'src/wristband/wristband.service';
import { TicketStatus } from 'src/ticket/entities/ticket.entity';
import { WristbandStatus } from 'src/wristband/entities/wristband.entity';
import { CheckInDto } from './dto/check_in.dto';
import { RedeemItem } from 'src/redeem/entities/redeem-item.entity';
import { RedeemItemStatus } from 'src/redeem/enums/redeem-item.enums';

@Injectable()
export class CheckInService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly ticketService: TicketService,
    private readonly wristbandService: WristbandService,
  ) { }

  /**
   * Check-in berdasarkan strategi redeem
   * Support: code (universal), itemCode (WRISTBAND/BIB), ticketCode (NONE)
   */
  async checkIn(checkInDto: CheckInDto, organizerId?: string) {
    // New unified approach - smart detection
    if (checkInDto.code) {
      return this.checkInByCode(checkInDto.code, organizerId);
    }

    // Legacy support - specific code types
    if (checkInDto.itemCode) {
      return this.checkInByItemCode(checkInDto.itemCode, organizerId);
    } else if (checkInDto.ticketCode) {
      return this.checkInByTicketCode(checkInDto.ticketCode, organizerId);
    } else {
      throw new BadRequestException('Must provide code, itemCode, or ticketCode');
    }
  }

  /**
   * Smart code detection - tries itemCode first, then ticketCode
   */
  async checkInByCode(code: string, organizerId?: string) {
    return this.dataSource.transaction(async (manager) => {
      // Try as itemCode first (for CONCERT/RUNNING with wristband/BIB)
      const redeemItem = await manager.getRepository(RedeemItem).findOne({
        where: { itemCode: code },
      });

      if (redeemItem) {
        // Found as itemCode, use itemCode check-in flow
        return this.checkInByItemCode(code, organizerId);
      }

      // Not found as itemCode, try as ticketCode (for SEMINAR)
      return this.checkInByTicketCode(code, organizerId);
    });
  }

  /**
   * Check-in berdasarkan itemCode (untuk WRISTBAND/BIB strategy)
   */
  async checkInByItemCode(itemCode: string, organizerId?: string) {
    return this.dataSource.transaction(async (manager) => {
      // 1️⃣ Cari redeem item berdasarkan itemCode
      const redeemItem = await manager.getRepository(RedeemItem).findOne({
        where: { itemCode },
        relations: ['ticket', 'ticket.attendee', 'ticket.category', 'ticket.category.event', 'ticket.category.event.organizer']
      });

      if (!redeemItem) {
        throw new NotFoundException('Redeem item not found');
      }

      if (!redeemItem.ticket) {
        throw new BadRequestException('Redeem item not assigned to any ticket');
      }

      // 🔒 Authorization Check
      if (organizerId) {
        const eventOrganizerId = redeemItem.ticket.category?.event?.organizer?.id;
        if (eventOrganizerId && eventOrganizerId !== organizerId) {
          throw new BadRequestException('You can only check-in attendees for your own events');
        }
      }

      if (redeemItem.status === RedeemItemStatus.CHECKED_IN) {
        throw new BadRequestException('Redeem item already checked in');
      }

      // 2️⃣ Ambil tiket yang terkait
      const ticket = redeemItem.ticket;

      if (ticket.status === TicketStatus.CHECKED_IN) {
        throw new BadRequestException('Ticket already checked in');
      }

      // 3️⃣ Update status keduanya
      const now = new Date();

      redeemItem.status = RedeemItemStatus.CHECKED_IN;
      ticket.status = TicketStatus.CHECKED_IN;

      // 4️⃣ Simpan perubahan
      await manager.save(redeemItem);
      await manager.save(ticket);

      return {
        message: 'Check-in successful',
        itemCode: redeemItem.itemCode,
        ticketCode: ticket.ticketCode,
        checkedInAt: now,
        assignedTicket: {
          ticketCode: ticket.ticketCode,
          attendee: ticket.attendee,
          category: ticket.category,
        },
      };
    });
  }

  /**
   * Check-in berdasarkan ticketCode (untuk NONE strategy)
   */
  async checkInByTicketCode(ticketCode: string, organizerId?: string) {
    return this.dataSource.transaction(async (manager) => {
      // 1️⃣ Cari tiket berdasarkan ticketCode dengan relations
      const ticket = await manager.getRepository('Ticket').findOne({
        where: { ticketCode },
        relations: ['attendee', 'category', 'category.event', 'category.event.organizer'],
      });

      if (!ticket) {
        throw new NotFoundException('Ticket not found');
      }

      // 🔒 Authorization Check
      if (organizerId) {
        const eventOrganizerId = ticket.category?.event?.organizer?.id;
        if (eventOrganizerId && eventOrganizerId !== organizerId) {
          throw new BadRequestException('You can only check-in attendees for your own events');
        }
      }

      if (ticket.status === TicketStatus.CHECKED_IN) {
        throw new BadRequestException('Ticket already checked in');
      }

      // 2️⃣ Update status tiket
      const now = new Date();
      ticket.status = TicketStatus.CHECKED_IN;

      // 3️⃣ Simpan perubahan
      await manager.save(ticket);

      return {
        message: 'Check-in successful',
        ticketCode: ticket.ticketCode,
        checkedInAt: now,
        assignedTicket: {
          ticketCode: ticket.ticketCode,
          attendee: ticket.attendee,
          category: ticket.category,
        },
      };
    });
  }

  /**
   * Check-in berdasarkan kode gelang (wristbandCode) - LEGACY
   */
  // async checkInByWristband(checkInDto: CheckInDto) {
  //   return this.dataSource.transaction(async (manager) => {
  //     // 1️⃣ Cari gelang berdasarkan kode
  //     const wristband = await this.wristbandService.findOneByCode(checkInDto.wristbandCode!, manager);

  //     if (!wristband.assignedTicket) {
  //       throw new BadRequestException('Wristband not assigned to any ticket');
  //     }

  //     if (wristband.status === WristbandStatus.CHECKED_IN) {
  //       throw new BadRequestException('Wristband already checked in');
  //     }

  //     // 2️⃣ Ambil tiket yang terkait
  //     const ticket = await this.ticketService.findOneByCode(wristband.assignedTicket.ticketCode as string, manager);
  //     if (!ticket) throw new NotFoundException('Linked ticket not found');

  //     if (ticket.status === TicketStatus.CHECKED_IN) {
  //       throw new BadRequestException('Ticket already checked in');
  //     }

  //     // 3️⃣ Update status keduanya
  //     const now = new Date();

  //     wristband.status = WristbandStatus.CHECKED_IN;
  //     wristband.checkedInAt = now;

  //     ticket.status = TicketStatus.CHECKED_IN;

  //     // 4️⃣ Simpan perubahan via EntityManager (agar satu transaksi)
  //     await this.wristbandService.saveChange(wristband, manager);
  //     await this.ticketService.saveChange(ticket, manager);

  //     return {
  //       message: 'Check-in successful',
  //       wristbandCode: wristband.wristbandCode,
  //       ticketCode: ticket.ticketCode,
  //       checkedInAt: now,
  //     };
  //   });
  // }

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

  async findAllCheckInListByEventSlug(eventSlug: string) {
    return this.wristbandService.findCheckedInWristbandByEvent(eventSlug);
  }

  /**
   * Get wristband with event and organizer info for authorization check
   */
  async getWristbandWithEvent(wristbandCode: string) {
    return this.wristbandService.findOneByCodeWithEventAndOrganizer(wristbandCode);
  }
}
