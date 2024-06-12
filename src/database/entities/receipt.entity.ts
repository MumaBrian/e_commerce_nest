import {
	Entity,
	PrimaryGeneratedColumn,
	ManyToOne,
	OneToMany,
	Column,
} from 'typeorm';
import { Order } from './order.entity';
import { Payment } from './payment.entity';
import { Warranty } from './warranty.entity';
@Entity()
export class Receipt {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => Order, (order) => order.OrderItems)
	order: Order;

	@ManyToOne(() => Payment, (payment) => payment.receipts)
	payment: Payment;

	@Column()
	date: Date;

	@Column('decimal')
	totalAmount: number;

	@Column('json')
	items: any;

	@OneToMany(() => Warranty, (warranty) => warranty.product)
	warranties: Warranty[];
}
