import { Injectable } from '@nestjs/common';
import { CreateOrganizerDashboardDto } from './dto/create-organizer-dashboard.dto';
import { UpdateOrganizerDashboardDto } from './dto/update-organizer-dashboard.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Event, EventStatus } from '../events/entities/event.entity';
import { TicketCategory } from '../ticket_categories/entities/ticket_category.entity';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../order/entities/order.entity';

@Injectable()
export class OrganizerDashboardService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(TicketCategory)
    private readonly ticketCategoryRepository: Repository<TicketCategory>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  create(createOrganizerDashboardDto: CreateOrganizerDashboardDto) {
    return 'This action adds a new organizerDashboard';
  }

  async getDashboardOverview(organizerId: string) {
    const [
      totalEvents,
      totalTicketsSold,
      totalRevenue,
      activeEvents,
      upcomingEvents
    ] = await Promise.all([
      this.getTotalEvents(organizerId),
      this.getTotalTicketsSold(organizerId),
      this.getTotalRevenue(organizerId),
      this.getActiveEventsCount(organizerId),
      this.getUpcomingEventsCount(organizerId),
    ]);

    return {
      totalEvents,
      totalTicketsSold,
      totalRevenue,
      activeEvents,
      upcomingEvents,
    };
  }

  async getTotalEvents(organizerId: string): Promise<number> {
    return await this.eventRepository.count({
      where: {
        organizer: {
          id: organizerId,
        },
      },
    });
  }

  async getTotalTicketsSold(organizerId: string): Promise<number> {
    const result = await this.ticketCategoryRepository
      .createQueryBuilder('tc')
      .select('SUM(tc.sold)', 'totalSold')
      .leftJoin('tc.event', 'event')
      .leftJoin('event.organizer', 'organizer')
      .where('organizer.id = :organizerId', { organizerId })
      .getRawOne();

    return parseInt(result?.totalSold || '0', 10);
  }

  async getTotalRevenue(organizerId: string): Promise<number> {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'totalRevenue')
      .leftJoin('order.orderItems', 'orderItem')
      .leftJoin('orderItem.ticketCategory', 'ticketCategory')
      .leftJoin('ticketCategory.event', 'event')
      .leftJoin('event.organizer', 'organizer')
      .where('organizer.id = :organizerId', { organizerId })
      .andWhere('order.status = :status', { status: OrderStatus.PAID })
      .getRawOne();

    return parseFloat(result?.totalRevenue || '0');
  }

  async getActiveEventsCount(organizerId: string): Promise<number> {
    const now = new Date();
    return await this.eventRepository
      .createQueryBuilder('event')
      .leftJoin('event.organizer', 'organizer')
      .where('organizer.id = :organizerId', { organizerId })
      .andWhere('event.startDate <= :now', { now })
      .andWhere('event.endDate >= :now', { now })
      .andWhere('event.status = :status', { status: EventStatus.PUBLISHED })
      .getCount();
  }

  async getUpcomingEventsCount(organizerId: string): Promise<number> {
    const now = new Date();
    return await this.eventRepository
      .createQueryBuilder('event')
      .leftJoin('event.organizer', 'organizer')
      .where('organizer.id = :organizerId', { organizerId })
      .andWhere('event.startDate > :now', { now })
      .andWhere('event.status = :status', { status: EventStatus.PUBLISHED })
      .getCount();
  }

  async getRecentEvents(organizerId: string, limit: number = 5) {
    return await this.eventRepository.find({
      where: {
        organizer: {
          id: organizerId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
      take: limit,
      relations: ['organizer'],
    });
  }

  async getEventsByStatus(organizerId: string) {
    const result = await this.eventRepository
      .createQueryBuilder('event')
      .select('event.status', 'status')
      .addSelect('COUNT(event.id)', 'count')
      .leftJoin('event.organizer', 'organizer')
      .where('organizer.id = :organizerId', { organizerId })
      .groupBy('event.status')
      .getRawMany();

    return result.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count, 10);
      return acc;
    }, {});
  }

  async getMonthlyRevenue(organizerId: string, year: number = new Date().getFullYear()) {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('MONTH(order.paidAt)', 'month')
      .addSelect('SUM(order.totalAmount)', 'revenue')
      .leftJoin('order.orderItems', 'orderItem')
      .leftJoin('orderItem.ticketCategory', 'ticketCategory')
      .leftJoin('ticketCategory.event', 'event')
      .leftJoin('event.organizer', 'organizer')
      .where('organizer.id = :organizerId', { organizerId })
      .andWhere('order.status = :status', { status: OrderStatus.PAID })
      .andWhere('YEAR(order.paidAt) = :year', { year })
      .groupBy('MONTH(order.paidAt)')
      .orderBy('MONTH(order.paidAt)', 'ASC')
      .getRawMany();

    // Initialize all months with 0
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: 0,
    }));

    // Fill in actual revenue data
    result.forEach((item) => {
      const monthIndex = parseInt(item.month, 10) - 1;
      monthlyRevenue[monthIndex].revenue = parseFloat(item.revenue);
    });

    return monthlyRevenue;
  }

  async getSalesChart(organizerId: string, days: number = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);

    console.log(`📊 Getting sales chart for organizer ${organizerId}, days: ${days}`);
    console.log(`📅 Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('DATE(order.paidAt)', 'date')
      .addSelect('COUNT(DISTINCT order.id)', 'sales')
      .addSelect('SUM(order.totalAmount)', 'revenue')
      .leftJoin('order.orderItems', 'orderItem')
      .leftJoin('orderItem.ticketCategory', 'ticketCategory')
      .leftJoin('ticketCategory.event', 'event')
      .leftJoin('event.organizer', 'organizer')
      .where('organizer.id = :organizerId', { organizerId })
      .andWhere('order.status = :status', { status: OrderStatus.PAID })
      .andWhere('DATE(order.paidAt) >= :startDate', { startDate: startDate.toISOString().split('T')[0] })
      .andWhere('DATE(order.paidAt) <= :endDate', { endDate: endDate.toISOString().split('T')[0] })
      .groupBy('DATE(order.paidAt)')
      .orderBy('DATE(order.paidAt)', 'ASC')
      .getRawMany();

    console.log(`📈 Raw query result:`, result);

    // Initialize all days with 0
    const salesData: Array<{ date: string; sales: number; revenue: number }> = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      salesData.push({
        date: date.toISOString().split('T')[0],
        sales: 0,
        revenue: 0,
      });
    }

    // Fill in actual sales data
    result.forEach((item) => {
      const dateIndex = salesData.findIndex(d => d.date === item.date);
      if (dateIndex !== -1) {
        salesData[dateIndex].sales = parseInt(item.sales, 10);
        salesData[dateIndex].revenue = parseFloat(item.revenue);
      }
    });

    console.log(`📊 Final sales data:`, salesData);

    return salesData;
  }

  async getWeeklyRevenue(organizerId: string, weeks: number = 4) {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('YEARWEEK(order.paidAt, 1)', 'week')
      .addSelect('SUM(order.totalAmount)', 'revenue')
      .leftJoin('order.orderItems', 'orderItem')
      .leftJoin('orderItem.ticketCategory', 'ticketCategory')
      .leftJoin('ticketCategory.event', 'event')
      .leftJoin('event.organizer', 'organizer')
      .where('organizer.id = :organizerId', { organizerId })
      .andWhere('order.status = :status', { status: OrderStatus.PAID })
      .andWhere('order.paidAt IS NOT NULL')
      .groupBy('YEARWEEK(order.paidAt, 1)')
      .orderBy('YEARWEEK(order.paidAt, 1)', 'DESC')
      .limit(weeks)
      .getRawMany();

    return result.map((item) => ({
      week: item.week,
      revenue: parseFloat(item.revenue),
    })).reverse(); // Reverse to show oldest first
  }

  async getTopEvents(organizerId: string, limit: number = 10) {
    const result = await this.eventRepository
      .createQueryBuilder('event')
      .select('event.id', 'id')
      .addSelect('event.title', 'title')
      .addSelect('event.startDate', 'startDate')
      .addSelect('SUM(tc.sold)', 'totalSold')
      .addSelect('SUM(tc.sold * tc.price)', 'totalRevenue')
      .leftJoin('event.ticketCategories', 'tc')
      .leftJoin('event.organizer', 'organizer')
      .where('organizer.id = :organizerId', { organizerId })
      .groupBy('event.id')
      .orderBy('SUM(tc.sold * tc.price)', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map((item) => ({
      id: item.id,
      title: item.title,
      startDate: item.startDate,
      totalSold: parseInt(item.totalSold || '0', 10),
      totalRevenue: parseFloat(item.totalRevenue || '0'),
    }));
  }

  async getEventPerformance(organizerId: string, eventId: string) {
    const [event, ticketsSold, revenue, orderCount] = await Promise.all([
      this.eventRepository.findOne({
        where: { id: eventId, organizer: { id: organizerId } },
        relations: ['organizer', 'ticketCategories'],
      }),
      this.getEventTicketsSold(eventId),
      this.getEventRevenue(eventId),
      this.getEventOrderCount(eventId),
    ]);

    if (!event) {
      throw new Error('Event not found or access denied');
    }

    return {
      event,
      ticketsSold,
      revenue,
      orderCount,
      ticketCategories: event.ticketCategories.map((tc) => ({
        id: tc.id,
        name: tc.name,
        price: tc.price,
        sold: tc.sold,
        maxQuantity: tc.maxQuantity,
        remaining: tc.maxQuantity - tc.sold,
      })),
    };
  }

  private async getEventTicketsSold(eventId: string): Promise<number> {
    const result = await this.ticketCategoryRepository
      .createQueryBuilder('tc')
      .select('SUM(tc.sold)', 'totalSold')
      .where('tc.eventId = :eventId', { eventId })
      .getRawOne();

    return parseInt(result?.totalSold || '0', 10);
  }

  private async getEventRevenue(eventId: string): Promise<number> {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'totalRevenue')
      .leftJoin('order.orderItems', 'orderItem')
      .leftJoin('orderItem.ticketCategory', 'ticketCategory')
      .where('ticketCategory.eventId = :eventId', { eventId })
      .andWhere('order.status = :status', { status: OrderStatus.PAID })
      .getRawOne();

    return parseFloat(result?.totalRevenue || '0');
  }

  private async getEventOrderCount(eventId: string): Promise<number> {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(DISTINCT order.id)', 'orderCount')
      .leftJoin('order.orderItems', 'orderItem')
      .leftJoin('orderItem.ticketCategory', 'ticketCategory')
      .where('ticketCategory.eventId = :eventId', { eventId })
      .andWhere('order.status = :status', { status: OrderStatus.PAID })
      .getRawOne();

    return parseInt(result?.orderCount || '0', 10);
  }

  findAll() {
    return `This action returns all organizerDashboard`;
  }

  update(id: number, updateOrganizerDashboardDto: UpdateOrganizerDashboardDto) {
    return `This action updates a #${id} organizerDashboard`;
  }

  remove(id: number) {
    return `This action removes a #${id} organizerDashboard`;
  }
}
