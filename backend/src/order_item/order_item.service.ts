import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateOrderItemDto } from './dto/create-order_item.dto';
import { UpdateOrderItemDto } from './dto/update-order_item.dto';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/order_item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/order/entities/order.entity';
import { OrderService } from 'src/order/order.service';
import { TicketCategoriesService } from 'src/ticket_categories/ticket_categories.service';

@Injectable()
export class OrderItemService {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    private readonly ticketCategoryService: TicketCategoriesService,
  ) {}

  async create(createOrderItemDto: CreateOrderItemDto, orderId: string) {
    // Pastikan order dan produk valid
    const order = await this.orderService.findOneOrThrow(orderId);
    Logger.log(`Order found : ${order.id}`)

    const ticketCategory = await this.ticketCategoryService.findOneOrThrow(
      createOrderItemDto.categoryId,
    );

    const subtotal = ticketCategory.price * createOrderItemDto.quantity;

    // Buat entitas baru
    const orderItem = this.orderItemRepository.create({
      order,  
      subtotal,
      ticketCategory,
      quantity: createOrderItemDto.quantity,
      unitPrice: ticketCategory.price,
    });

    // Simpan ke database
    return await this.orderItemRepository.save(orderItem);
  }

 

  findAll() {
    return `This action returns all orderItem`;
  }

  findOne(id: number) {
    return `This action returns a #${id} orderItem`;
  }

  update(id: number, updateOrderItemDto: UpdateOrderItemDto) {
    return `This action updates a #${id} orderItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} orderItem`;
  }
}
