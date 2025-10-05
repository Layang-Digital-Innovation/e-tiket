import { PartialType } from '@nestjs/mapped-types';
import { CreateWristbandDto } from './create-wristband.dto';

export class UpdateWristbandDto extends PartialType(CreateWristbandDto) {}
