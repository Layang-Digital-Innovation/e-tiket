import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TicketCategoriesService } from './ticket_categories.service';
import { CreateTicketCategoryDto } from './dto/create-ticket_category.dto';
import { UpdateTicketCategoryDto } from './dto/update-ticket_category.dto';
import { AuditController } from 'src/common/decorators/audit.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/users/entities/user.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('api/ticket-categories')
@AuditController()
@UseGuards(JwtAuthGuard)
export class TicketCategoriesController {
  constructor(private readonly ticketCategoriesService: TicketCategoriesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVENT_ORGANIZER)
  create(@Body() createTicketCategoryDto: CreateTicketCategoryDto) {
    return this.ticketCategoriesService.create(createTicketCategoryDto);
  }

  @Get()
  findAll() {
    return this.ticketCategoriesService.findAll();
  }

  @Get('event/:eventId')
  findByEventId(@Param('eventId') eventId: string) {
    return this.ticketCategoriesService.findByEventId(eventId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketCategoriesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTicketCategoryDto: UpdateTicketCategoryDto) {
    return this.ticketCategoriesService.update(id, updateTicketCategoryDto);

  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVENT_ORGANIZER)
  remove(@Param('id') id: string) {
    return this.ticketCategoriesService.remove(id);
  }
}
