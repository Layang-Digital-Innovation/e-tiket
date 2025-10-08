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
  UseInterceptors,
  UseFilters,
  HttpStatus,
} from '@nestjs/common';
import { EventsService } from '../../events/events.service';
import { CreateEventDto } from '../../events/dto/create-event.dto';
import { UpdateEventDto } from '../../events/dto/update-event.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { EventStatus } from '../../events/entities/event.entity';
import { ResponseInterceptor } from '../interceptors/response.interceptor';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { ApiResponseDto } from '../dto/api-response.dto';

// Contoh implementasi controller dengan common response pattern
@Controller('api/events-v2')
@UseInterceptors(ResponseInterceptor)
@UseFilters(HttpExceptionFilter)
export class EventsWithCommonResponseController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVENT_ORGANIZER, UserRole.USER)
  async create(
    @Body(ValidationPipe) createEventDto: CreateEventDto,
    @Request() req,
  ) {
    const event = await this.eventsService.create(createEventDto, req.user.id);

    // Manual response formatting (opsional, interceptor akan handle otomatis)
    return ApiResponseDto.success(
      event,
      'Event created successfully',
      HttpStatus.CREATED,
    );
  }

  @Get()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('status') status?: EventStatus,
  ) {
    // Service akan return data biasa, interceptor akan format otomatis
    return this.eventsService.findAll(page, limit, status);
  }

  @Get('my-events')
  @UseGuards(JwtAuthGuard)
  async findMyEvents(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const result = await this.eventsService.findByOrganizer(
      req.user.id,
      page,
      limit,
    );

    // Contoh manual formatting untuk pagination
    return ApiResponseDto.paginated(
      result.events,
      {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
      'My events retrieved successfully',
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const event = await this.eventsService.findOne(id);

    return ApiResponseDto.success(event, 'Event retrieved successfully');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVENT_ORGANIZER, UserRole.USER)
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateEventDto: UpdateEventDto,
    @Request() req,
  ) {
    const event = await this.eventsService.update(
      id,
      updateEventDto,
      req.user.id,
      req.user.role,
    );

    return ApiResponseDto.success(event, 'Event updated successfully');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVENT_ORGANIZER, UserRole.USER)
  async remove(@Param('id') id: string, @Request() req) {
    await this.eventsService.remove(id, req.user.id, req.user.role);

    return ApiResponseDto.success(
      null,
      'Event deleted successfully',
      HttpStatus.NO_CONTENT,
    );
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EVENT_ORGANIZER, UserRole.USER)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: EventStatus,
    @Request() req,
  ) {
    const event = await this.eventsService.updateStatus(
      id,
      status,
      req.user.id,
      req.user.role,
    );

    return ApiResponseDto.success(event, 'Event status updated successfully');
  }
}
