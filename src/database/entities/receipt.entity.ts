import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Order } from './order.entity';
import { Payment } from './payment.entity';

@Entity()
export class Receipt {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Order, (order) => order.receipts)
	order: Order;

	@ManyToOne(() => Payment, (payment) => payment.receipts)
	payment: Payment;

	@Column()
	date: Date;

	@Column('decimal')
	totalAmount: number;

	@Column('json')
	items: any;

	@Column('json')
	warrantyInfo: any;
}
