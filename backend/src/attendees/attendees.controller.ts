import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AttendeesService } from './attendees.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';

@Controller('attendees')
export class AttendeesController {
  constructor(private readonly attendeesService: AttendeesService) {}

  @Post()
  create(@Body() createAttendeeDto: CreateAttendeeDto) {
    return this.attendeesService.create(createAttendeeDto);
  }

  @Get()
  findAll() {
    return this.attendeesService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.attendeesService.findOne(+id);
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAttendeeDto: UpdateAttendeeDto) {
    return this.attendeesService.update(+id, updateAttendeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendeesService.remove(+id);
  }

  @Get('event/:eventSlug')
  async findByEventSlug(
    @Param('eventSlug') eventSlug: string,
    @Query('status') status?: string,
  ) {
    try {
      const attendees = await this.attendeesService.findByEventSlug(eventSlug, status);
      return attendees
    } catch (error) {
      throw error;
    }
  }

  @Get('event/:eventSlug/export')
  async exportByEventSlug(
    @Param('eventSlug') eventSlug: string,
    @Res() res: Response,
    @Query('status') status?: string,
  ) {
    try {
      const xlsx = await this.attendeesService.exportXlsxByEventSlug(eventSlug, status);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',);
      res.setHeader('Content-Disposition', `attachment; filename="attendees-${eventSlug}-${new Date().toISOString().split('T')[0]}.xlsx"`);
      res.send(xlsx);
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to export attendees',
        error: error.message,
      });
    }
  }

  // Backward compatibility routes (deprecated)
  @Get('event-id/:eventId')
  async findByEvent(
    @Param('eventId') eventId: string,
    @Query('status') status?: string,
  ) {
    try {
      const attendees = await this.attendeesService.findByEvent(eventId, status);
      return {
        success: true,
        data: attendees,
        total: attendees.length,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('event-id/:eventId/export')
  async exportByEvent(
    @Param('eventId') eventId: string,
    @Res() res: Response,
    @Query('status') status?: string,
  ) {
    try {
      const csv = await this.attendeesService.exportCsvByEvent(eventId, status);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="attendees-${eventId}-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to export attendees',
        error: error.message,
      });
    }
  }
}
