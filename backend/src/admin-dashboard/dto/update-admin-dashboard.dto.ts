import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminDashboardDto } from './create-admin-dashboard.dto';

export class UpdateAdminDashboardDto extends PartialType(CreateAdminDashboardDto) {}
