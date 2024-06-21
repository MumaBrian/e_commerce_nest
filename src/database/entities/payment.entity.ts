import {
	Entity,
	PrimaryGeneratedColumn,
	ManyToOne,
	Column,
	OneToMany,
} from 'typeorm';
import { Order } from './order.entity';
import { Receipt } from './receipt.entity';

@Entity()
export class Payment {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => Order, (order) => order.orderItems)
	order: Order;

	@Column('decimal')
	amount: number;

	@Column()
	method: string;

	@Column()
	status: string;

	@OneToMany(() => Receipt, (receipt) => receipt.payment)
	receipts: Receipt;
}
