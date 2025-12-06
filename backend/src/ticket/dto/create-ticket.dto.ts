import { IsArray, IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAttendeeDto } from './create-attendee.dto';

export class CreateTicketDto {
    @IsNotEmpty()
    @IsUUID()
    categoryId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAttendeeDto)
    attendees: CreateAttendeeDto[];
}
