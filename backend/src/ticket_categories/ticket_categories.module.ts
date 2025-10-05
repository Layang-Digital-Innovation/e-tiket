import { Module } from '@nestjs/common';
import { TicketCategoriesService } from './ticket_categories.service';
import { TicketCategoriesController } from './ticket_categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketCategory } from './entities/ticket_category.entity';
import { WristbandModule } from 'src/wristband/wristband.module';

@Module({
  imports: [TypeOrmModule.forFeature([TicketCategory]), WristbandModule],
  controllers: [TicketCategoriesController],
  providers: [TicketCategoriesService],
})
export class TicketCategoriesModule {}
