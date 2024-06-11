import {
	Entity,
	PrimaryGeneratedColumn,
	ManyToOne,
	OneToMany,
	Column,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { Customer } from './customer.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Order {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => Customer, (customer) => customer.orders)
	customer: Customer;

	@OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
		cascade: true,
	})
	items: OrderItem[];

	@Column('decimal')
	total: number;

	@ApiProperty({
		description: 'Status of the order',
		enum: OrderStatus,
	})
	@Column({ type: 'enum', enum: OrderStatus })
	status: OrderStatus;

	@ApiProperty({
		description: 'Payment method for the order',
		enum: PaymentMethod,
	})
	@Column({ type: 'enum', enum: PaymentMethod })
	paymentMethod: PaymentMethod;
}
