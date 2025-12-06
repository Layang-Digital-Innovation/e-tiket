import { Body, Controller, Get, Param, Post, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { CheckInService } from './check_in.service';
import { CheckInDto } from './dto/check_in.dto';
import { AuditController } from 'src/common/decorators/audit.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { EventsService } from 'src/events/events.service';

@Controller('check-in')
@AuditController()
export class CheckInController {
    constructor(
        private readonly checkInService: CheckInService,
        private readonly eventsService: EventsService,
    ) { }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.EVENT_ORGANIZER)
    async findAllAssignedWristband() {
        return this.checkInService.findAllAssignedWristband();
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.EVENT_ORGANIZER)
    async checkIn(@Body() checkInDto: CheckInDto, @Request() req) {
        // Pass organizerId to service for ownership verification
        // If user is ADMIN, do not enforce ownership check (pass undefined)
        const organizerId = req.user.role === UserRole.ADMIN ? undefined : req.user.id;
        return this.checkInService.checkIn(checkInDto, organizerId);
    }

    @Get('event/:eventId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.EVENT_ORGANIZER)
    async findAllCheckInListByEvent(
        @Param('eventId') eventId: string,
        @Request() req,
    ) {
        // Verify organizer can only view check-in list for their own events
        if (req.user.role !== UserRole.ADMIN) {
            const event = await this.eventsService.findOne(eventId);
            if (event.organizer.id !== req.user.id) {
                throw new ForbiddenException('You can only view check-in list for your own events');
            }
        }

        return this.checkInService.findAllCheckInListByEvent(eventId);
    }

    @Get('event-slug/:eventSlug')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.EVENT_ORGANIZER)
    async findAllCheckInListByEventSlug(
        @Param('eventSlug') eventSlug: string,
        @Request() req,
    ) {
        // Verify organizer can only view check-in list for their own events
        if (req.user.role !== UserRole.ADMIN) {
            const event = await this.eventsService.findBySlug(eventSlug);
            if (event.organizer.id !== req.user.id) {
                throw new ForbiddenException('You can only view check-in list for your own events');
            }
        }

        return this.checkInService.findAllCheckInListByEventSlug(eventSlug);
    }


}
