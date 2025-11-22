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
  Validate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryMode, EventStatus } from '../entities/event.entity';
import { EventType, RedeemStrategy } from '../enums/event.enums';
import { AuditDto } from '../../common/dto/audit.dto';

// Custom validator for date comparison
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'isEventDateValid', async: false })
export class IsEventDateValidConstraint implements ValidatorConstraintInterface {
  validate(endDate: any, args: ValidationArguments) {
    const startDate = (args.object as any).startDate;
    if (!startDate || !endDate) return false;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // End date must be after or equal to start date
    if (end < start) return false;
    
    // If same day, ensure end time is not before start time
    if (start.toDateString() === end.toDateString()) {
      return end.getTime() >= start.getTime();
    }
    
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'End date must be after or equal to start date. For events on the same day, end time must be after or equal to start time.';
  }
}


export class CreateEventDto extends AuditDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(EventType)
  eventType: EventType;

  @IsEnum(RedeemStrategy)
  @IsOptional()
  redeemStrategy?: RedeemStrategy;

  @IsEnum(DeliveryMode)
  deliveryMode: DeliveryMode;

  @IsOptional()
  webinarJoinUrl?: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @Validate(IsEventDateValidConstraint)
  endDate: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxCapacity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  basePrice?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  termsAndConditions?: string;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;
}