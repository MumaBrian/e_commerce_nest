import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToOne,
	JoinColumn,
	OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Order } from './order.entity';

@Entity()
export class Customer {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@OneToOne(() => User)
	@JoinColumn()
	user: User;

	@Column()
	address: string;

	@OneToMany(() => Order, (order) => order.customer, { onDelete: 'CASCADE' })
	orders: Order[];

	@Column()
	phone: string;
}
