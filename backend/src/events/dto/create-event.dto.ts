import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUrl,
  IsBoolean,
  Min,
} from 'class-validator';
import { EventStatus } from '../entities/event.entity';
import { AuditDto } from '../../common/dto/audit.dto';

export class CreateEventDto extends AuditDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxCapacity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  basePrice?: number;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  termsAndConditions?: string;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;
}