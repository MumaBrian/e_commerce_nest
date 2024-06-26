import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/database/entities/customer.entity';
import { Product } from 'src/database/entities/product.entity';
import { Order } from 'src/database/entities/order.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/database/entities/user.entity';
@Module({
	imports: [
		TypeOrmModule.forFeature([Customer, Product, Order, User]),
		AuthModule,
	],
	controllers: [CustomerController],
	providers: [CustomerService],
})
export class CustomerModule {}
