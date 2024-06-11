import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from '../database/entities/order.entity';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../database/entities/product.entity';
import { Customer } from 'src/database/entities/customer.entity';
import { OrderItem } from 'src/database/entities/order-item.entity';
@Module({
	imports: [
		TypeOrmModule.forFeature([Order, Product, Customer, OrderItem]),
		AuthModule,
	],
	providers: [OrdersService],
	controllers: [OrdersController],
})
export class OrdersModule {}
