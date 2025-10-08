import {
  IsUUID,
  IsNotEmpty,
  IsInt,
  Min,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAttendeeDto } from 'src/attendees/dto/create-attendee.dto';

export class CreateOrderItemDto {
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttendeeDto)
  detailAtendee: CreateAttendeeDto[];
}
