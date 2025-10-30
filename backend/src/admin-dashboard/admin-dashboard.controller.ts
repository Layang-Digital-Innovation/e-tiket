import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { CreateAdminDashboardDto } from './dto/create-admin-dashboard.dto';
import { UpdateAdminDashboardDto } from './dto/update-admin-dashboard.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@Controller('api/admin-dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Post()
  create(@Body() createAdminDashboardDto: CreateAdminDashboardDto) {
    return this.adminDashboardService.create(createAdminDashboardDto);
  }

  @Get()
  findAll() {
    return this.adminDashboardService.findAll();
  }

  @Get('stats')
  async getStats() {
    const [
      totalUsers,
      totalEventOrganizers,
      totalEvents,
      totalTickets,
      totalRevenue,
      activeEvents,
      usersGrowth,
      eventOrganizersGrowth,
      ticketsSoldGrowth,
      revenueGrowth
    ] = await Promise.all([
      this.adminDashboardService.getTotalUsers(),
      this.adminDashboardService.getTotalEventOrganizers(),
      this.adminDashboardService.getTotalEvents(),
      this.adminDashboardService.getTotalTickets(),
      this.adminDashboardService.getTotalRevenue(),
      this.adminDashboardService.getTotalActiveEvents(),
      this.adminDashboardService.getUsersGrowth(),
      this.adminDashboardService.getEventOrganizersGrowth(),
      this.adminDashboardService.getTicketsSoldGrowth(),
      this.adminDashboardService.getRevenueGrowth(),
    ]);

    return {
      totalUsers,
      totalEventOrganizers,
      totalEvents,
      totalTicketsSold: totalTickets,
      totalRevenue,
      activeEvents,
      growth: {
        users: {
          percentage: Math.round(usersGrowth.growthPercentage * 100) / 100,
          period: 'bulan lalu'
        },
        eventOrganizers: {
          count: eventOrganizersGrowth.growthCount,
          period: 'minggu ini'
        },
        ticketsSold: {
          percentage: Math.round(ticketsSoldGrowth.growthPercentage * 100) / 100,
          period: 'bulan lalu'
        },
        revenue: {
          percentage: Math.round(revenueGrowth.growthPercentage * 100) / 100,
          period: 'bulan lalu'
        }
      }
    };
  }

  @Get('users')
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    const filters: any = {};
    if (role) filters.role = role;
    if (status) filters.status = status;
    if (search) filters.search = search;

    const result = await this.adminDashboardService.getAllUsers(pageNum, limitNum, filters);

    return result;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdminDashboardDto: UpdateAdminDashboardDto) {
    return this.adminDashboardService.update(+id, updateAdminDashboardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminDashboardService.remove(+id);
  }
}
