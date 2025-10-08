import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketCategory } from '../entities/ticket_category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TicketCategoriesValidationService {
    
    constructor(
        @InjectRepository(TicketCategory)
        private readonly ticketCategoryRepo: Repository<TicketCategory>,
    ) {}


    async validateCategoryAvailable(categoryId: string): Promise<TicketCategory> {
        const category = await this.ticketCategoryRepo.findOne({ where: { id: categoryId } });
    
        if (!category) {
          throw new NotFoundException('Ticket category not found');
        }

        if (category.sold >= category.maxQuantity){
            throw new BadRequestException('Ticket category must not sold out')
        }
    
        return category;
      }

   


}
