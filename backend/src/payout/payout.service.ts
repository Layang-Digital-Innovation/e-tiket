import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payout, PayoutStatus } from './entities/payout.entity';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { UpdatePayoutDto } from './dto/update-payout.dto';
import { ApprovePayoutDto } from './dto/approve-payout.dto';
import { RejectPayoutDto } from './dto/reject-payout.dto';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { EventsService } from 'src/events/events.service';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/entities/user.entity';

@Injectable()
export class PayoutService {
  constructor(
    @InjectRepository(Payout) private payoutRepository: Repository<Payout>,
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private eventsService: EventsService,
  ) {}

  /**
   * Hitung total pendapatan organizer dari tiket yang sudah PAID
   */
  async calculateOrganizerRevenue(organizerId: string, eventId?: string) {
    // Debug: Check what events exist for this organizer
    const eventsResponse = await this.eventsService.findByOrganizer(organizerId);
    Logger.log('Events for organizer:', eventsResponse.events?.map(e => ({ id: e.id, title: e.title })) || []);

    // Debug: Check order statuses in database
    const orderStatuses = await this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoin('ticket.orderItem', 'order_item')
      .leftJoin('order_item.order', 'ticket_order')
      .select('DISTINCT ticket_order.status', 'status')
      .getRawMany();
    Logger.log('Available order statuses:', orderStatuses);

    const query = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoin('ticket.orderItem', 'order_item')
      .leftJoin('order_item.order', 'ticket_order')
      .leftJoin('order_item.ticketCategory', 'category')
      .leftJoin('category.event', 'event')
      .where('event.organizer_id = :organizerId', { organizerId })
      .andWhere('ticket_order.status = :orderStatus', { orderStatus: 'paid' });

    if (eventId) {
      query.andWhere('event.id = :eventId', { eventId });
    }

    // Select SUM BEFORE getRawOne
    query.select('SUM(CAST(order_item.unitPrice as DECIMAL))', 'total');

    // Debug: Log the SQL query
    Logger.log('SQL Query:', query.getSql());
    Logger.log('Parameters:', { organizerId, eventId });

    const result = await query.getRawOne();

    Logger.log("result", result);

    return parseFloat(result?.total || 0);
  }

  /**
   * Buat request payout baru
   */
  async createPayout(organizerId: string, createPayoutDto: CreatePayoutDto, currentUser: any) {
    // Validasi organizer hanya bisa membuat payout untuk dirinya sendiri
    if (organizerId !== currentUser.id && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk membuat payout untuk organizer lain');
    }

    // Hitung total pendapatan
    const grossAmount = await this.calculateOrganizerRevenue(organizerId, createPayoutDto.eventId);

    if (grossAmount === 0) {
      throw new BadRequestException('Tidak ada pendapatan yang dapat dicairkan');
    }

    // Validasi nominal payout tidak melebihi pendapatan
    if (createPayoutDto.netAmount > grossAmount) {
      throw new BadRequestException(
        `Nominal payout tidak boleh melebihi total pendapatan (${grossAmount})`
      );
    }

    // Hitung platform fee (bisa dikonfigurasi, default 0 untuk sekarang)
    const platformFee = grossAmount - createPayoutDto.netAmount;

    // Ambil data organizer
    const organizer = await this.getOrganizerById(organizerId);

    // Buat payout record
    const payout = this.payoutRepository.create({
      organizer,
      event: createPayoutDto.eventId ? await this.eventsService.findOne(createPayoutDto.eventId) : undefined,
      grossAmount,
      platformFee,
      netAmount: createPayoutDto.netAmount,
      bankAccountName: createPayoutDto.bankAccountName,
      bankAccountNumber: createPayoutDto.bankAccountNumber,
      bankType: createPayoutDto.bankType,
      bankBranch: createPayoutDto.bankBranch,
      notes: createPayoutDto.notes,
      status: PayoutStatus.PENDING,
    });

    return this.payoutRepository.save(payout);
  }

  /**
   * Dapatkan semua payout untuk organizer
   */
  async getOrganizerPayouts(organizerId: string, status?: PayoutStatus) {
    const query = this.payoutRepository
      .createQueryBuilder('payout')
      .where('payout.organizer_id = :organizerId', { organizerId })
      .leftJoinAndSelect('payout.organizer', 'organizer')
      .leftJoinAndSelect('payout.event', 'event')
      .leftJoinAndSelect('payout.approvedBy', 'approvedBy')
      .orderBy('payout.createdAt', 'DESC');

    if (status) {
      query.andWhere('payout.status = :status', { status });
    }

    return query.getMany();
  }

  /**
   * Dapatkan semua payout (untuk admin)
   */
  async getAllPayouts(status?: PayoutStatus, organizerId?: string) {
    const query = this.payoutRepository
      .createQueryBuilder('payout')
      .leftJoinAndSelect('payout.organizer', 'organizer')
      .leftJoinAndSelect('payout.event', 'event')
      .leftJoinAndSelect('payout.approvedBy', 'approvedBy')
      .orderBy('payout.createdAt', 'DESC');

    if (status) {
      query.andWhere('payout.status = :status', { status });
    }

    if (organizerId) {
      query.andWhere('payout.organizer_id = :organizerId', { organizerId });
    }

    return query.getMany();
  }

  /**
   * Dapatkan detail payout
   */
  async getPayoutDetail(payoutId: string) {
    const payout = await this.payoutRepository
      .createQueryBuilder('payout')
      .where('payout.id = :payoutId', { payoutId })
      .leftJoinAndSelect('payout.organizer', 'organizer')
      .leftJoinAndSelect('payout.event', 'event')
      .leftJoinAndSelect('payout.approvedBy', 'approvedBy')
      .getOne();

    if (!payout) {
      throw new NotFoundException('Payout tidak ditemukan');
    }

    return payout;
  }

  /**
   * Approve payout (admin only)
   */
  async approvePayout(payoutId: string, approvePayoutDto: ApprovePayoutDto, adminId: string) {
    const payout = await this.getPayoutDetail(payoutId);

    if (payout.status !== PayoutStatus.PENDING) {
      throw new BadRequestException(`Payout dengan status ${payout.status} tidak dapat diapprove`);
    }

    const admin = await this.getOrganizerById(adminId);

    payout.status = PayoutStatus.APPROVED;
    payout.approvedAt = new Date();
    payout.approvedBy = admin;
    payout.notes = approvePayoutDto.notes || payout.notes;
    payout.referenceNumber = approvePayoutDto.referenceNumber || payout.referenceNumber;

    return this.payoutRepository.save(payout);
  }

  /**
   * Reject payout (admin only)
   */
  async rejectPayout(payoutId: string, rejectPayoutDto: RejectPayoutDto) {
    const payout = await this.getPayoutDetail(payoutId);

    if (payout.status !== PayoutStatus.PENDING) {
      throw new BadRequestException(`Payout dengan status ${payout.status} tidak dapat ditolak`);
    }

    payout.status = PayoutStatus.REJECTED;
    payout.rejectedAt = new Date();
    payout.rejectionReason = rejectPayoutDto.rejectionReason;

    return this.payoutRepository.save(payout);
  }

  /**
   * Mark payout as paid (admin only, after manual transfer)
   */
  async markAsPaid(payoutId: string, referenceNumber?: string) {
    const payout = await this.getPayoutDetail(payoutId);

    if (payout.status !== PayoutStatus.APPROVED) {
      throw new BadRequestException(`Hanya payout dengan status approved yang dapat dimark sebagai paid`);
    }

    payout.status = PayoutStatus.PAID;
    payout.paidAt = new Date();
    if (referenceNumber) {
      payout.referenceNumber = referenceNumber;
    }

    return this.payoutRepository.save(payout);
  }

  /**
   * Cancel payout (organizer atau admin)
   */
  async cancelPayout(payoutId: string, userId: string, isAdmin: boolean) {
    const payout = await this.getPayoutDetail(payoutId);

    // Organizer hanya bisa cancel payout miliknya sendiri yang masih pending
    if (!isAdmin && payout.organizer.id !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk membatalkan payout ini');
    }

    if (!isAdmin && payout.status !== PayoutStatus.PENDING) {
      throw new BadRequestException('Organizer hanya bisa membatalkan payout dengan status pending');
    }

    payout.status = PayoutStatus.CANCELLED;

    return this.payoutRepository.save(payout);
  }

  /**
   * Helper: Get organizer by ID
   */
  private async getOrganizerById(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }
    return user;
  }
}
