import { OrderItem } from './../database/entities/order-item.entity';
import { Module } from '@nestjs/common';
import { OrderItemService } from './orderitems.service';
import { OrderItemController } from './orderitems.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/database/entities/order.entity';
import { Product } from '../database/entities/product.entity';
import { AuthModule } from 'src/auth/auth.module';
@Module({
	imports: [
		TypeOrmModule.forFeature([OrderItem, Order, Product]),
		AuthModule,
	],
	controllers: [OrderItemController],
	providers: [OrderItemService],
})
export class OrderitemsModule {}
