import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, LessThan } from 'typeorm';
import { TicketCategory } from 'src/ticket_categories/entities/ticket_category.entity';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>
  ) {}

  async findOneByCode(ticketCode: string, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(Ticket)
      : this.ticketRepository;
    const ticket = await repository.findOne({
      where: {
        ticketCode,
      },
      relations: ['category', 'orderItem', 'assignedWristband', 'attendee', 'assignedRedeemItem'],
    });

    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async saveChange(ticket: Ticket, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(Ticket)
      : this.ticketRepository;
    await repository.save(ticket);
  }

  create(createTicketDto: CreateTicketDto) {
    return this.ticketRepository.save(createTicketDto);
  }

  async findAll(manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(Ticket)
      : this.ticketRepository;
    return repository.find({
      relations: ['category', 'orderItem', 'assignedWristband', 'attendee'],
    });
  }

  async findTicketsByEventSlug(eventSlug: string, status?: string, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(Ticket)
      : this.ticketRepository;
    
    const queryBuilder = repository
      .createQueryBuilder('ticket')
      .innerJoinAndSelect('ticket.category', 'category')
      .innerJoinAndSelect('category.event', 'event')
      .where('event.slug = :eventSlug', { eventSlug });

    // Add status filter if provided
    if (status) {
      queryBuilder.andWhere('ticket.status = :status', { status: status.toLowerCase() });
    }

    queryBuilder.orderBy('ticket.createdAt', 'ASC');

    console.log('=== TICKET SERVICE DEBUG ===');
    console.log('Event Slug:', eventSlug);
    console.log('Status filter:', status);
    console.log('SQL Query:', queryBuilder.getSql());
    console.log('Parameters:', queryBuilder.getParameters());

    const tickets = await queryBuilder.getMany();
    console.log(`Found ${tickets.length} tickets for slug: ${eventSlug}`);
    
    if (tickets.length > 0) {
      console.log('Sample ticket:', {
        id: tickets[0].id,
        ticketCode: tickets[0].ticketCode,
        status: tickets[0].status,
        categoryId: tickets[0].category?.id,
        eventSlug: tickets[0].category?.event?.slug,
        eventTitle: tickets[0].category?.event?.title
      });
    } else {
      // Debug: Check if event exists
      console.log('=== DEBUGGING - CHECK IF EVENT EXISTS ===');
      const eventCheckQuery = `
        SELECT e.id, e.slug, e.title, 
               COUNT(tc.id) as category_count,
               COUNT(t.id) as ticket_count
        FROM events e
        LEFT JOIN ticket_category tc ON e.id = tc.event_id
        LEFT JOIN tickets t ON tc.id = t.category_id
        WHERE e.slug = $1
        GROUP BY e.id, e.slug, e.title
      `;
      
      const debugResult = await repository.query(eventCheckQuery, [eventSlug]);
      console.log('Event check result:', debugResult);
      
      if (debugResult.length === 0) {
        console.log(`❌ Event with slug '${eventSlug}' not found in database`);
      } else {
        const event = debugResult[0];
        console.log(`✅ Event found: ${event.title}`);
        console.log(`📊 Categories: ${event.category_count}, Tickets: ${event.ticket_count}`);
        
        if (event.ticket_count === '0') {
          console.log('❌ No tickets found for this event');
        }
      }
    }

    return tickets;
  }

  async findOne(id: string, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(Ticket)
      : this.ticketRepository;
    return repository.findOne({
      where: {
        id,
      },
      relations: ['category', 'orderItem', 'assignedWristband'],
    });
  }

  update(id: string, updateTicketDto: UpdateTicketDto) {
    return this.ticketRepository.update(id, updateTicketDto);
  }

  remove(id: string) {
    return this.ticketRepository.delete(id);
  }

  getTotalTickets(): Promise<number> {
    return this.ticketRepository.count();
  }

  getTicketsCountBeforeDate(date: Date): Promise<number> {
    return this.ticketRepository.count({
      where: {
        createdAt: LessThan(date)
      }
    });
  }

  /**
   * Find all unused tickets for an event
   */
  async findUnusedTicketsByEvent(eventId: string, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(Ticket)
      : this.ticketRepository;
    return repository.find({
      where: {
        status: TicketStatus.UNUSED,
        category: { event: { id: eventId } }
      },
      relations: ['category', 'orderItem', 'attendee'],
    });
  }

  /**
   * Find all redeemed tickets for an event
   */
  async findRedeemedTicketsByEvent(eventId: string, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(Ticket)
      : this.ticketRepository;
    return repository.find({
      where: {
        status: TicketStatus.REDEEMED,
        category: { event: { id: eventId } }
      },
      relations: ['category', 'orderItem', 'assignedWristband', 'attendee'],
    });
  }

  /**
   * Find all checked-in tickets for an event
   */
  async findCheckedInTicketsByEvent(eventId: string, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(Ticket)
      : this.ticketRepository;
    return repository.find({
      where: {
        status: TicketStatus.CHECKED_IN,
        category: { event: { id: eventId } }
      },
      relations: ['category', 'orderItem', 'assignedWristband', 'attendee'],
    });
  }

  /**
   * Get ticket statistics for an event
   */
  async getTicketStatisticsByEvent(eventId: string, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(Ticket)
      : this.ticketRepository;

    const unused = await repository.count({
      where: {
        status: TicketStatus.UNUSED,
        category: { event: { id: eventId } }
      }
    });

    const redeemed = await repository.count({
      where: {
        status: TicketStatus.REDEEMED,
        category: { event: { id: eventId } }
      }
    });

    const checkedIn = await repository.count({
      where: {
        status: TicketStatus.CHECKED_IN,
        category: { event: { id: eventId } }
      }
    });

    return {
      unused,
      redeemed,
      checkedIn,
      total: unused + redeemed + checkedIn
    };
  }

  /**
   * Validate ticket status before redeem
   */
  async validateTicketForRedeem(ticketCode: string, manager?: EntityManager): Promise<Ticket> {
    const ticket = await this.findOneByCode(ticketCode, manager);

    if (ticket.status !== TicketStatus.UNUSED) {
      throw new BadRequestException(
        `Ticket cannot be redeemed. Current status: ${ticket.status}`
      );
    }

    if (!ticket.attendee) {
      throw new BadRequestException('Ticket must have attendee information');
    }

    return ticket;
  }

  /**
   * Mark ticket as redeemed
   */
  async markAsRedeemed(ticketCode: string, manager?: EntityManager): Promise<Ticket> {
    const ticket = await this.validateTicketForRedeem(ticketCode, manager);
    
    ticket.status = TicketStatus.REDEEMED;
    ticket.redeemedAt = new Date();

    await this.saveChange(ticket, manager);
    return ticket;
  }

  /**
   * Mark ticket as checked in
   */
  async markAsCheckedIn(ticketCode: string, manager?: EntityManager): Promise<Ticket> {
    const ticket = await this.findOneByCode(ticketCode, manager);

    if (ticket.status === TicketStatus.CHECKED_IN) {
      throw new BadRequestException('Ticket already checked in');
    }

    if (ticket.status !== TicketStatus.REDEEMED) {
      throw new BadRequestException(
        `Ticket must be redeemed before check-in. Current status: ${ticket.status}`
      );
    }

    ticket.status = TicketStatus.CHECKED_IN;
    await this.saveChange(ticket, manager);
    return ticket;
  }

  /**
   * Find tickets by category
   */
  async findTicketsByCategory(categoryId: string, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(Ticket)
      : this.ticketRepository;
    return repository.find({
      where: {
        category: { id: categoryId }
      },
      relations: ['category', 'orderItem', 'assignedWristband', 'attendee'],
    });
  }

  /**
   * Find tickets by order item
   */
  async findTicketsByOrderItem(orderItemId: string, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(Ticket)
      : this.ticketRepository;
    return repository.find({
      where: {
        orderItem: { id: orderItemId }
      },
      relations: ['category', 'orderItem', 'assignedWristband', 'attendee'],
    });
  }

  /**
   * Generate test tickets for testing redeem and check-in flows
   * Usage: POST /api/ticket/test/generate?categoryId=uuid&quantity=10
   */
  async generateTestTickets(categoryId: string, quantity: number = 10) {
    const tickets: Ticket[] = [];
    
    // Get category with event info
    const category = await this.ticketRepository.manager.getRepository(TicketCategory).findOne({
      where: { id: categoryId },
      relations: ['event']
    });

    if (!category) {
      throw new NotFoundException('Ticket category not found');
    }

    for (let i = 0; i < quantity; i++) {
      const ticket = new Ticket();
      ticket.category = category;
      ticket.status = TicketStatus.UNUSED;
      
      // Generate ticket code via BeforeInsert hook
      await ticket.generateTicketCode();
      
      tickets.push(ticket);
    }

    const savedTickets = await this.ticketRepository.save(tickets);
    
    return {
      message: `Generated ${quantity} test tickets`,
      count: savedTickets.length,
      eventId: category.event.id,
      ticketCategoryId: category.id,
      tickets: savedTickets.map((t: Ticket) => ({
        id: t.id,
        ticketCode: t.ticketCode,
        status: t.status,
        categoryId: t.category?.id,
        eventId: category.event.id
      }))
    };
  }

}
