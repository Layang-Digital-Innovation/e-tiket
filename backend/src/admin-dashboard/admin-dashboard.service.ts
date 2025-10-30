import { Injectable } from '@nestjs/common';
import { CreateAdminDashboardDto } from './dto/create-admin-dashboard.dto';
import { UpdateAdminDashboardDto } from './dto/update-admin-dashboard.dto';
import { UsersService } from 'src/users/users.service';
import { EventsService } from 'src/events/events.service';
import { TicketService } from 'src/ticket/ticket.service';
import { OrderService } from 'src/order/order.service';

@Injectable()
export class AdminDashboardService {

  constructor(
    private readonly usersService: UsersService,
    private readonly eventsService: EventsService,
    private readonly ticketService: TicketService,
    private readonly orderService: OrderService,
  ) {}

  create(createAdminDashboardDto: CreateAdminDashboardDto) {
    return 'This action adds a new adminDashboard';
  }

  getTotalUsers(): Promise<number> {
    return this.usersService.getTotalUsers();
  }

  getTotalEvents(): Promise<number> {
    return this.eventsService.getTotalEvents();
  }

  getTotalTickets(): Promise<number> {
    return this.ticketService.getTotalTickets();
  }

  getTotalRevenue(): Promise<number> {
    return this.orderService.getTotalRevenue();
  }

  getTotalEventOrganizers(): Promise<number> {
    return this.usersService.getTotalEventOrganizers();
  }

  getTotalActiveEvents(): Promise<number> {
    return this.eventsService.getTotalActiveEvents();
  }

  // Growth calculation methods
  async getUsersGrowth(): Promise<{ previousValue: number; growthPercentage: number }> {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const currentValue = await this.usersService.getTotalUsers();

    // Count users created before current month (simulating previous month data)
    const previousValue = await this.usersService.getUsersCountBeforeDate(currentMonth);

    const growthPercentage = previousValue > 0
      ? ((currentValue - previousValue) / previousValue) * 100
      : 0;

    return { previousValue, growthPercentage };
  }

  async getEventOrganizersGrowth(): Promise<{ previousValue: number; growthCount: number }> {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const currentValue = await this.usersService.getTotalEventOrganizers();

    // Count EO registered in the last week
    const newInWeek = await this.usersService.getEventOrganizersCountAfterDate(oneWeekAgo);

    return { previousValue: currentValue - newInWeek, growthCount: newInWeek };
  }

  async getTicketsSoldGrowth(): Promise<{ previousValue: number; growthPercentage: number }> {
    // For tickets, we'll use order items count as ticket sales
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const currentValue = await this.ticketService.getTotalTickets();

    // Count tickets sold before current month
    const previousValue = await this.ticketService.getTicketsCountBeforeDate(currentMonth);

    const growthPercentage = previousValue > 0
      ? ((currentValue - previousValue) / previousValue) * 100
      : 0;

    return { previousValue, growthPercentage };
  }

  async getRevenueGrowth(): Promise<{ previousValue: number; growthPercentage: number }> {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const currentValue = await this.orderService.getTotalRevenue();

    // Calculate revenue before current month
    const previousValue = await this.orderService.getRevenueBeforeDate(currentMonth);

    const growthPercentage = previousValue > 0
      ? ((currentValue - previousValue) / previousValue) * 100
      : 0;

    return { previousValue, growthPercentage };
  }

  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    filters: any = {},
  ): Promise<{ users: any[]; total: number; page: number; limit: number }> {
    // Use UsersService to get all users with filtering
    // For now, we'll implement basic filtering - can be enhanced later
    const result = await this.usersService.findAllUsers(page, limit, filters);
    return result;
  }

  findAll() {
    return `This action returns all adminDashboard`;
  }

  findOne(id: number) {
    return `This action returns a #${id} adminDashboard`;
  }

  update(id: number, updateAdminDashboardDto: UpdateAdminDashboardDto) {
    return `This action updates a #${id} adminDashboard`;
  }

  remove(id: number) {
    return `This action removes a #${id} adminDashboard`;
  }
}
