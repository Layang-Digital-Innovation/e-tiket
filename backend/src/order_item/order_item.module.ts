import { forwardRef, Module } from '@nestjs/common';
import { OrderItemService } from './order_item.service';
import { OrderItemController } from './order_item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './entities/order_item.entity';
import { OrderModule } from 'src/order/order.module';
import { TicketCategoriesModule } from 'src/ticket_categories/ticket_categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderItem]),
    forwardRef(() => OrderModule),
    TicketCategoriesModule,
],
  controllers: [OrderItemController],
  providers: [OrderItemService],
  exports: [OrderItemService],
})
export class OrderItemModule {}
