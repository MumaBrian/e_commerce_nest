import {
	Entity,
	PrimaryGeneratedColumn,
	ManyToOne,
	OneToMany,
	Column,
} from 'typeorm';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from './payment.entity';
import { Receipt } from './receipt.entity';

@Entity()
export class Order {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.orders)
	user: User;

	@OneToMany(() => OrderItem, (orderItem) => orderItem.order)
	items: OrderItem[];

	@Column('decimal')
	total: number;

	@Column()
	status: string;

	@Column()
	paymentMethod: string;

	@OneToMany(() => Payment, (payment) => payment.order)
	payments: Payment;

	@OneToMany(() => Receipt, (receipt) => receipt.order)
	receipts: Receipt;
}
