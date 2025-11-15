import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, NotFoundException, ForbiddenException } from '@nestjs/common';
import { RedeemService } from './redeem.service';
import { RedeemDto, GenerateRedeemItemsDto } from './dto/create-redeem.dto';
import { UpdateRedeemDto } from './dto/update-redeem.dto';
import { AuditController } from 'src/common/decorators/audit.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { TicketCategory } from 'src/ticket_categories/entities/ticket_category.entity';

@Controller('api/redeem')
@AuditController()
export class RedeemController {
  constructor(private readonly redeemService: RedeemService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EVENT_ORGANIZER, UserRole.ADMIN)
  async redeemTicket(@Request() req, @Body() redeemDto: RedeemDto) {
    const organizerId = req.user.role === 'admin' ? 'admin' : req.user.id;
    
    // Support both legacy wristband redeem and new strategy-based redeem
    if (redeemDto.wristbandCode && !redeemDto.itemCode) {
      // Legacy wristband redeem
      return this.redeemService.redeemTicketToWristband(
        redeemDto.ticketCode,
        redeemDto.wristbandCode
      );
    } else {
      // New strategy-based redeem
      return this.redeemService.redeemTicket(
        redeemDto.ticketCode,
        redeemDto.eventId,
        organizerId,
        {
          itemCode: redeemDto.itemCode || redeemDto.wristbandCode,
          redeemStrategy: redeemDto.redeemStrategy
        }
      );
    }
  }

  @Post('assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EVENT_ORGANIZER, UserRole.ADMIN)
  async assignRedeemItem(@Request() req, @Body() redeemDto: RedeemDto) {
    const organizerId = req.user.role === 'admin' ? 'admin' : req.user.id;
    if (!redeemDto.itemCode) {
      throw new Error('itemCode is required');
    }
    return this.redeemService.assignRedeemItemToTicket(
      redeemDto.ticketCode,
      redeemDto.itemCode,
      redeemDto.eventId,
      organizerId
    );
  }

  @Post('generate-items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EVENT_ORGANIZER, UserRole.ADMIN)
  async generateRedeemItems(@Request() req, @Body() generateDto: GenerateRedeemItemsDto) {
    // Authorization check - organizer must own the event
    const ticketCategory = await this.redeemService['dataSource'].getRepository(TicketCategory)
      .findOne({
        where: { id: generateDto.ticketCategoryId },
        relations: ['event', 'event.organizer']
      });

    if (!ticketCategory) {
      throw new NotFoundException('Ticket category not found');
    }

    const organizerId = req.user.role === 'admin' ? 'admin' : req.user.id;
    if (organizerId !== 'admin' && ticketCategory.event.organizer.id !== req.user.id) {
      throw new ForbiddenException('You can only generate redeem items for your own events');
    }

    return this.redeemService.generateRedeemItemsBulk(
      generateDto.ticketCategoryId,
      generateDto.quantity,
      req.user.id
    );
  }

  @Get('job/:jobId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EVENT_ORGANIZER, UserRole.ADMIN)
  getBulkGenerationJobStatus(@Param('jobId') jobId: string) {
    return this.redeemService.getBulkGenerationJobStatus(jobId);
  }

  @Get('event/:eventId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll(@Param('eventId') eventId: string) {
    return this.redeemService.findAllByEventId(eventId);
  }

  @Get('items/event/:eventId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EVENT_ORGANIZER, UserRole.ADMIN)
  findRedeemItemsByEvent(@Param('eventId') eventId: string) {
    return this.redeemService.findRedeemItemsByEvent(eventId);
  }

  @Get('stats/event/:eventId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EVENT_ORGANIZER, UserRole.ADMIN)
  getRedeemStatisticsByEvent(@Param('eventId') eventId: string) {
    return this.redeemService.getRedeemStatisticsByEvent(eventId);
  }

  @Get('validate/:code/event/:eventId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EVENT_ORGANIZER, UserRole.ADMIN)
  validateRedeemCode(@Param('code') code: string, @Param('eventId') eventId: string) {
    return this.redeemService.validateRedeemCode(code, eventId);
  }

  @Get('display/:ticketCode')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EVENT_ORGANIZER, UserRole.ADMIN)
  getRedeemItemDisplay(@Param('ticketCode') ticketCode: string) {
    return this.redeemService.getRedeemItemDisplay(ticketCode);
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
