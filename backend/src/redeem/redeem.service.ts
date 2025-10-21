import { BadRequestException, Injectable } from '@nestjs/common';
import { RedeemDto } from './dto/create-redeem.dto';
import { UpdateRedeemDto } from './dto/update-redeem.dto';
import { TicketService } from 'src/ticket/ticket.service';
import { WristbandService } from 'src/wristband/wristband.service';
import { TicketStatus } from 'src/ticket/entities/ticket.entity';
import { Wristband, WristbandStatus } from 'src/wristband/entities/wristband.entity';
import { DataSource } from 'typeorm';

export interface RedeemResponse {
  message: string;
  ticketCode: string;
  wristbandCode: string;
}

@Injectable()
export class RedeemService {

  constructor(
    private readonly dataSource: DataSource,
    private readonly ticketService: TicketService,
    private readonly wristbandService: WristbandService,
  ) {}

  async redeemTicketToWristband(ticketCode: string, wristbandCode: string): Promise<RedeemResponse> {
    return this.dataSource.transaction(async (manager) => {
      const ticket = await this.ticketService.findOneByCode(ticketCode, manager);
      const wristband = await this.wristbandService.findOneByCode(wristbandCode, manager);

      if (ticket.status !== TicketStatus.UNUSED) {
        throw new BadRequestException('Ticket already redeemed or checked in');
      }

      if (wristband.status !== WristbandStatus.UNUSED) {
        throw new BadRequestException('Wristband already assigned');
      }

      ticket.status = TicketStatus.REDEEMED;
      ticket.redeemedAt = new Date();
      ticket.assignedWristband = wristband;

      wristband.status = WristbandStatus.ASSIGNED;
      wristband.assignedTicket = ticket;
      wristband.assignedAt = new Date();

      await this.ticketService.saveChange(ticket, manager);
      await this.wristbandService.saveChange(wristband, manager);

      return {
        message: 'Ticket successfully redeemed to wristband',
        ticketCode: ticket.ticketCode,
        wristbandCode: wristband.wristbandCode!,
      };
    });
  }
  /**
   * Get all assigned wristbands (redeemed tickets)
   * Returns list of wristbands with status ASSIGNED
   */
  async findAllByEventId(eventId: string): Promise<Wristband[]> {
    return this.dataSource.getRepository(Wristband).find({
      where: { status: WristbandStatus.ASSIGNED, event: { id: eventId } },
      relations: ['assignedTicket', 'event', 'category'],
      order: { assignedAt: 'DESC' },
    });
  }

  /**
   * Get a specific assigned wristband by ID
   */
  async findOne(id: string): Promise<Wristband | null> {
    return this.dataSource.getRepository(Wristband).findOne({
      where: { id, status: WristbandStatus.ASSIGNED },
      relations: ['assignedTicket', 'event', 'category'],
    });
  }

  update(id: number, updateRedeemDto: UpdateRedeemDto) {
    // Since redeem operations are typically one-time actions,
    // we don't need to update redeem records
    // This method could be used for administrative purposes if needed
    return `This action updates a #${id} redeem`;
  }

  remove(id: number) {
    // Redeem operations should not be deleted as they represent
    // historical ticket-to-wristband assignments
    return `This action removes a #${id} redeem`;
  }
}
