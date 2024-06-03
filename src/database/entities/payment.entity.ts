import {
	Entity,
	PrimaryGeneratedColumn,
	ManyToOne,
	Column,
	OneToMany,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Receipt } from './receipt.entity';

@Entity()
export class Payment {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => OrderItem, (orderItem) => orderItem.order)
	order: OrderItem;

	@Column('decimal')
	amount: number;

	@Column()
	method: string;

	@Column()
	status: string;

	@OneToMany(() => Receipt, (receipt) => receipt.payment)
	receipts: Receipt;
}
