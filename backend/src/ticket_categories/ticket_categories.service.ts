import { Injectable } from '@nestjs/common';
import { CreateTicketCategoryDto } from './dto/create-ticket_category.dto';
import { UpdateTicketCategoryDto } from './dto/update-ticket_category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketCategory } from './entities/ticket_category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TicketCategoriesService {

    constructor(
    @InjectRepository(TicketCategory)
    private ticketCategoriesRepository: Repository<TicketCategory>
  ) {}


  create(createTicketCategoryDto: CreateTicketCategoryDto) {
    const ticketCategory = this.ticketCategoriesRepository.create(createTicketCategoryDto);
    return this.ticketCategoriesRepository.save(ticketCategory);
  }

  findAll() {
    return this.ticketCategoriesRepository.find();
  }

  findOne(id: string) {
    return this.ticketCategoriesRepository.findOne({ where: { id } });
  }

  update(id: string, updateTicketCategoryDto: UpdateTicketCategoryDto) {
    return this.ticketCategoriesRepository.update(id, updateTicketCategoryDto);
  }

  remove(id: string) {
    return this.ticketCategoriesRepository.delete(id);
  }
}
