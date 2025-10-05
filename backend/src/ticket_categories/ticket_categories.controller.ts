import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TicketCategoriesService } from './ticket_categories.service';
import { CreateTicketCategoryDto } from './dto/create-ticket_category.dto';
import { UpdateTicketCategoryDto } from './dto/update-ticket_category.dto';
import { AuditController } from 'src/common/decorators/audit.decorator';

@Controller('api/ticket-categories')
@AuditController()
export class TicketCategoriesController {
  constructor(private readonly ticketCategoriesService: TicketCategoriesService) {}

  @Post()
  create(@Body() createTicketCategoryDto: CreateTicketCategoryDto) {
    return this.ticketCategoriesService.create(createTicketCategoryDto);
  }

  @Get()
  findAll() {
    return this.ticketCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketCategoriesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTicketCategoryDto: UpdateTicketCategoryDto) {
    return this.ticketCategoriesService.update(id, updateTicketCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketCategoriesService.remove(id);
  }
}
