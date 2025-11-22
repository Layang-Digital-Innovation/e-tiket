import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  Patch,
} from '@nestjs/common';
import { PayoutService } from './payout.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { UpdatePayoutDto } from './dto/update-payout.dto';
import { ApprovePayoutDto } from './dto/approve-payout.dto';
import { RejectPayoutDto } from './dto/reject-payout.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PayoutStatus } from './entities/payout.entity';
import { UserRole } from 'src/users/entities/user.entity';

@Controller('payouts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  /**
   * Hitung revenue organizer
   * GET /api/payouts/revenue?eventId=xxx
   */
  @Get('revenue')
  @Roles(UserRole.ADMIN, UserRole.EVENT_ORGANIZER)
  async calculateRevenue(@Request() req, @Query('eventId') eventId?: string) {
    const organizerId = req.user.role === 'admin' ? req.query.organizerId : req.user.id;
    const revenue = await this.payoutService.calculateOrganizerRevenue(organizerId, eventId);
    return {
      success: true,
      data: {
        revenue,
      },
    };
  }

  /**
   * Buat request payout baru
   * POST /api/payouts
   */
  @Post()
  @Roles(UserRole.EVENT_ORGANIZER, UserRole.ADMIN)
  async createPayout(@Request() req, @Body() createPayoutDto: CreatePayoutDto) {
    const organizerId = req.user.role === 'admin' && req.body.organizerId ? req.body.organizerId : req.user.id;
    const payout = await this.payoutService.createPayout(organizerId, createPayoutDto, req.user);
    return {
      success: true,
      message: 'Payout request berhasil dibuat',
      data: payout,
    };
  }

  /**
   * Dapatkan payout organizer
   * GET /api/payouts/organizer/:organizerId?status=pending
   * MUST come before @Get(':id') to match correctly
   */
  @Get('organizer/:organizerId')
  @Roles(UserRole.EVENT_ORGANIZER, UserRole.ADMIN)
  async getOrganizerPayouts(
    @Param('organizerId') organizerId: string,
    @Request() req,
    @Query('status') status?: PayoutStatus,
  ) {
    // Organizer hanya bisa lihat payout miliknya sendiri
    if (req.user.role === UserRole.EVENT_ORGANIZER && req.user.id !== organizerId) {
      return {
        success: false,
        message: 'Anda tidak memiliki akses',
        statusCode: 403,
      };
    }

    const payouts = await this.payoutService.getOrganizerPayouts(organizerId, status);
    return {
      success: true,
      data: payouts,
    };
  }

  /**
   * Dapatkan detail payout
   * GET /api/payouts/:id
   */
  @Get(':id')
  @Roles(UserRole.EVENT_ORGANIZER, UserRole.ADMIN)
  async getPayoutDetail(@Param('id') payoutId: string, @Request() req) {
    const payout = await this.payoutService.getPayoutDetail(payoutId);

    // Organizer hanya bisa lihat payout miliknya sendiri
    if (req.user.role === UserRole.EVENT_ORGANIZER && payout.organizer.id !== req.user.id) {
      return {
        success: false,
        message: 'Anda tidak memiliki akses',
        statusCode: 403,
      };
    }

    return {
      success: true,
      data: payout,
    };
  }

  /**
   * Dapatkan semua payout (admin only)
   * GET /api/payouts?status=pending&organizerId=xxx
   * MUST come after specific routes
   */
  @Get()
  @Roles(UserRole.ADMIN)
  async getAllPayouts(
    @Query('status') status?: PayoutStatus,
    @Query('organizerId') organizerId?: string,
  ) {
    const payouts = await this.payoutService.getAllPayouts(status, organizerId);
    return payouts;
  }

  /**
   * Approve payout (admin only)
   * PATCH /api/payouts/:id/approve
   */
  @Patch(':id/approve')
  @Roles(UserRole.ADMIN)
  async approvePayout(
    @Param('id') payoutId: string,
    @Body() approvePayoutDto: ApprovePayoutDto,
    @Request() req,
  ) {
    const payout = await this.payoutService.approvePayout(payoutId, approvePayoutDto, req.user.id);
    return {
      success: true,
      message: 'Payout berhasil diapprove',
      data: payout,
    };
  }

  /**
   * Reject payout (admin only)
   * PATCH /api/payouts/:id/reject
   */
  @Patch(':id/reject')
  @Roles(UserRole.ADMIN)
  async rejectPayout(
    @Param('id') payoutId: string,
    @Body() rejectPayoutDto: RejectPayoutDto,
  ) {
    const payout = await this.payoutService.rejectPayout(payoutId, rejectPayoutDto);
    return {
      success: true,
      message: 'Payout berhasil ditolak',
      data: payout,
    };
  }

  /**
   * Mark payout as paid (admin only)
   * PATCH /api/payouts/:id/mark-paid
   */
  @Patch(':id/mark-paid')
  @Roles(UserRole.ADMIN)
  async markAsPaid(
    @Param('id') payoutId: string,
    @Body('referenceNumber') referenceNumber?: string,
  ) {
    const payout = await this.payoutService.markAsPaid(payoutId, referenceNumber);
    return {
      success: true,
      message: 'Payout berhasil dimark sebagai paid',
      data: payout,
    };
  }

  /**
   * Cancel payout
   * PATCH /api/payouts/:id/cancel
   */
  @Patch(':id/cancel')
  @Roles(UserRole.EVENT_ORGANIZER, UserRole.ADMIN)
  async cancelPayout(@Param('id') payoutId: string, @Request() req) {
    const payout = await this.payoutService.cancelPayout(payoutId, req.user.id, req.user.role === UserRole.ADMIN);
    return {
      success: true,
      message: 'Payout berhasil dibatalkan',
      data: payout,
    };
  }
}
