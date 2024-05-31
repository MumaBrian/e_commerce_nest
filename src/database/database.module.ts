import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Product } from './entities/product.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Category } from './entities/category.entity';
import { Payment } from './entities/payment.entity';
import { Receipt } from './entities/receipt.entity';
import { Warranty } from './entities/warranty.entity';

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: 'mysql',
				host: configService.get('database.host'),
				port: configService.get<number>('database.port'),
				username: configService.get('database.username'),
				password: configService.get('database.password'),
				database: configService.get('database.database'),
				entities: [
					User,
					Product,
					Order,
					OrderItem,
					Category,
					Payment,
					Receipt,
					Warranty,
				],
				synchronize: true, // Set to false in production
			}),
			inject: [ConfigService],
		}),
		TypeOrmModule.forFeature([
			User,
			Product,
			Order,
			OrderItem,
			Category,
			Payment,
			Receipt,
			Warranty,
		]),
	],
})
export class DatabaseModule {}
