import {
	Entity,
	PrimaryGeneratedColumn,
	ManyToOne,
	OneToMany,
	Column,
} from 'typeorm';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
@Entity()
export class Order {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => User, (user) => user.orders)
	user: User;

	@OneToMany(() => OrderItem, (orderItem) => orderItem.order)
	items: OrderItem[];

	@Column('decimal')
	total: number;

	@Column({ type: 'enum', enum: OrderStatus })
	status: OrderStatus;

	@Column({ type: 'enum', enum: PaymentMethod })
	paymentMethod: PaymentMethod;
}
