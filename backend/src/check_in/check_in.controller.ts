import { Body, Controller, Get, Post } from '@nestjs/common';
import { CheckInService } from './check_in.service';
import { CheckInDto } from './dto/check_in.dto';
import { AuditController } from 'src/common/decorators/audit.decorator';

@Controller('api/check-in')
@AuditController()
export class CheckInController {
    constructor(private readonly checkInService: CheckInService) {}

    @Get()
    async findAllAssignedWristband() {
        return this.checkInService.findAllAssignedWristband();
    }

    @Post()
    async checkIn(@Body() checkInDto: CheckInDto) {
        return this.checkInService.checkInByWristband(checkInDto);
    }

  
}
