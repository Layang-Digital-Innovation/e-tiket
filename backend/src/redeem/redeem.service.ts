import { BadRequestException, Injectable } from '@nestjs/common';
import { RedeemDto } from './dto/create-redeem.dto';
import { UpdateRedeemDto } from './dto/update-redeem.dto';
import { TicketService } from 'src/ticket/ticket.service';
import { WristbandService } from 'src/wristband/wristband.service';
import { TicketStatus } from 'src/ticket/entities/ticket.entity';
import { WristbandStatus } from 'src/wristband/entities/wristband.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class RedeemService {

  constructor(
    private readonly dataSource: DataSource,
    private readonly ticketService: TicketService,
    private readonly wristbandService: WristbandService,
  ) {}

  async redeemTicketToWristband(ticketCode: string, wristbandCode: string) {
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
      wristband.assignedTicketId = ticket.id;
      wristband.assignedTicketCode = ticket.ticketCode;
      wristband.assignedAt = new Date();

      await this.ticketService.saveChange(ticket, manager);
      await this.wristbandService.saveChange(wristband, manager);

      return {
        message: 'Ticket successfully redeemed to wristband',
        ticketCode: ticket.ticketCode,
        wristbandCode: wristband.wristbandCode,
      };
    });
  }
  findAll() {
    return `This action returns all redeem`;
  }

  findOne(id: string) {
    return `This action returns a #${id} redeem`;
  }

  update(id: number, updateRedeemDto: UpdateRedeemDto) {
    return `This action updates a #${id} redeem`;
  }

  remove(id: number) {
    return `This action removes a #${id} redeem`;
  }
}
