import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WristbandService } from './wristband.service';
import { CreateWristbandDto } from './dto/create-wristband.dto';
import { UpdateWristbandDto } from './dto/update-wristband.dto';

@Controller('wristband')
export class WristbandController {
  constructor(private readonly wristbandService: WristbandService) {}

  @Post()
  create(@Body() createWristbandDto: CreateWristbandDto) {
    return this.wristbandService.create(createWristbandDto);
  }

  @Get()
  findAll() {
    return this.wristbandService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wristbandService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWristbandDto: UpdateWristbandDto) {
    return this.wristbandService.update(id, updateWristbandDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wristbandService.remove(id);
  }
}
