import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RedeemService } from './redeem.service';
import { RedeemDto } from './dto/create-redeem.dto';
import { UpdateRedeemDto } from './dto/update-redeem.dto';
import { AuditController } from 'src/common/decorators/audit.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('api/redeem')
@AuditController()
export class RedeemController {
  constructor(private readonly redeemService: RedeemService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  redeem(@Body() createRedeemDto: RedeemDto) {
    return this.redeemService.redeemTicketToWristband(createRedeemDto.ticketCode, createRedeemDto.wristbandCode);
  }

  @Get('event/:eventId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll(@Param('eventId') eventId: string) {
    return this.redeemService.findAllByEventId(eventId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  findOne(@Param('id') id: string) {
    return this.redeemService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRedeemDto: UpdateRedeemDto) {
    return this.redeemService.update(+id, updateRedeemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.redeemService.remove(+id);
  }
}
