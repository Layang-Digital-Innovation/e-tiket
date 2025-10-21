import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { OrganizerDashboardService } from './organizer-dashboard.service';
import { CreateOrganizerDashboardDto } from './dto/create-organizer-dashboard.dto';
import { UpdateOrganizerDashboardDto } from './dto/update-organizer-dashboard.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('api/organizer-dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.EVENT_ORGANIZER)
export class OrganizerDashboardController {
  constructor(private readonly organizerDashboardService: OrganizerDashboardService) {}

  @Get('overview')
  getDashboardOverview(@GetUser() user: User) {
    return this.organizerDashboardService.getDashboardOverview(user.id);
  }

  @Get('events/recent')
  getRecentEvents(@GetUser() user: User) {
    return this.organizerDashboardService.getRecentEvents(user.id);
  }

  @Get('events/status')
  getEventsByStatus(@GetUser() user: User) {
    return this.organizerDashboardService.getEventsByStatus(user.id);
  }

  @Get('revenue/monthly')
  getMonthlyRevenue(@GetUser() user: User) {
    return this.organizerDashboardService.getMonthlyRevenue(user.id);
  }

  @Get('sales')
  getSalesChart(@GetUser() user: User, @Query('days') days?: string) {
    const daysNumber = days ? parseInt(days, 10) : 7;
    return this.organizerDashboardService.getSalesChart(user.id, daysNumber);
  }

  @Get('revenue/weekly')
  getWeeklyRevenue(@GetUser() user: User, @Query('weeks') weeks?: string) {
    const weeksNumber = weeks ? parseInt(weeks, 10) : 4;
    return this.organizerDashboardService.getWeeklyRevenue(user.id, weeksNumber);
  }

  @Get('events/top')
  getTopEvents(@GetUser() user: User) {
    return this.organizerDashboardService.getTopEvents(user.id);
  }

  @Get('events/:eventId/performance')
  getEventPerformance(@GetUser() user: User, @Param('eventId') eventId: string) {
    return this.organizerDashboardService.getEventPerformance(user.id, eventId);
  }

  // Legacy methods for backward compatibility
  @Post()
  create(@Body() createOrganizerDashboardDto: CreateOrganizerDashboardDto) {
    return this.organizerDashboardService.create(createOrganizerDashboardDto);
  }

 

 

 

 
}
