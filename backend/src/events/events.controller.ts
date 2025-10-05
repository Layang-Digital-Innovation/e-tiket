import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { EventStatus } from './entities/event.entity';
import { AuditController } from '../common/decorators/audit.decorator';
import { ResponseMessage } from 'src/common/decorators/response_message.decorator';

@Controller('api/event')
@AuditController()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVENT_ORGANIZER)
  @ResponseMessage('Event created successfully')
  create(@Body(ValidationPipe) createEventDto: CreateEventDto, @Request() req) {
    return this.eventsService.create(createEventDto, req.user.id);
  }

  @Get()
  @ResponseMessage('Events retrieved successfully')
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('status') status?: EventStatus,
  ) {
    return this.eventsService.findAll(page, limit, status);
  }

  @Get('my-events')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('My events retrieved successfully')
  findMyEvents(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.eventsService.findByOrganizer(req.user.id, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVENT_ORGANIZER, UserRole.USER)
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateEventDto: UpdateEventDto,
    @Request() req,
  ) {
    return this.eventsService.update(
      id,
      updateEventDto,
      req.user.id,
      req.user.role,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVENT_ORGANIZER, UserRole.USER)
  remove(@Param('id') id: string, @Request() req) {
    return this.eventsService.remove(id, req.user.id, req.user.role);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVENT_ORGANIZER, UserRole.USER)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: EventStatus,
    @Request() req,
  ) {
    return this.eventsService.updateStatus(
      id,
      status,
      req.user.id,
      req.user.role,
    );
  }
}