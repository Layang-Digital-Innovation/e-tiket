import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) { }

  @Post()
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketService.create(createTicketDto);
  }

  @Post('manual')
  createManual(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketService.createManualTicket(createTicketDto);
  }

  @Post('test/generate')
  async generateTestTickets(
    @Query('categoryId') categoryId: string,
    @Query('quantity') quantity: string = '10'
  ) {
    return this.ticketService.generateTestTickets(categoryId, parseInt(quantity));
  }

  @Get()
  findAll() {
    return this.ticketService.findAll();
  }

  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: string) {
    return this.ticketService.findUnusedTicketsByEvent(eventId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketService.update(id, updateTicketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketService.remove(id);
  }
}
