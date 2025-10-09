import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from './entities/ticket.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  async findOneByCode(ticketCode: string, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(Ticket)
      : this.ticketRepository;
    const ticket = await repository.findOne({
      where: {
        ticketCode,
      },
      relations: ['category', 'orderItem', 'assignedWristband'],
    });

    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async saveChange(ticket: Ticket, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(Ticket)
      : this.ticketRepository;
    await repository.save(ticket);
  }

  create(createTicketDto: CreateTicketDto) {
    return this.ticketRepository.save(createTicketDto);
  }

  async findAll(manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(Ticket)
      : this.ticketRepository;
    return repository.find({
      relations: ['category', 'orderItem', 'assignedWristband', 'attendee'],
    });
  }

  async findOne(id: string, manager?: EntityManager) {
    const repository = manager
      ? manager.getRepository(Ticket)
      : this.ticketRepository;
    return repository.findOne({
      where: {
        id,
      },
      relations: ['category', 'orderItem', 'assignedWristband'],
    });
  }

  update(id: string, updateTicketDto: UpdateTicketDto) {
    return this.ticketRepository.update(id, updateTicketDto);
  }

  remove(id: string) {
    return this.ticketRepository.delete(id);
  }
}
