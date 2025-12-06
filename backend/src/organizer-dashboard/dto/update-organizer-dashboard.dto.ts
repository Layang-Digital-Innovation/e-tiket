import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizerDashboardDto } from './create-organizer-dashboard.dto';

export class UpdateOrganizerDashboardDto extends PartialType(CreateOrganizerDashboardDto) {}
