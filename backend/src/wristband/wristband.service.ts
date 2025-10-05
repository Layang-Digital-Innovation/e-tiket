import { Injectable } from '@nestjs/common';
import { CreateWristbandDto } from './dto/create-wristband.dto';
import { UpdateWristbandDto } from './dto/update-wristband.dto';
import { Wristband, WristbandStatus } from './entities/wristband.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class WristbandService {

  constructor(
    @InjectRepository(Wristband) private wristbandRepository: Repository<Wristband>
  ) {}

  create(createWristbandDto: CreateWristbandDto) {
    return this.wristbandRepository.save(createWristbandDto);
  }


  generateWristbandByMaxCapacity(maxCapacity: number, eventId: string, categoryId: string) {
    const wristbands: CreateWristbandDto[] = [];
    for (let i = 0; i < maxCapacity; i++) {
       wristbands.push({
        eventId,
        categoryId,
        status: WristbandStatus.UNUSED,
       })
    }
    return this.wristbandRepository.save(wristbands);
  }



  findAll() {
    return this.wristbandRepository.find();
  }

  findOne(id: string) {
    return this.wristbandRepository.findOne({where: {id}});
  }

  update(id: string, updateWristbandDto: UpdateWristbandDto) {
    return this.wristbandRepository.update(id, updateWristbandDto);
  }

  remove(id: string) {
    return this.wristbandRepository.delete(id);
  }
}
