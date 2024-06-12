import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';

@Entity()
export class OrderItem {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => Order, (order) => order.OrderItems)
	order: Order;

	@ManyToOne(() => Product, (product) => product.orderItems)
	product: Product;

	@Column('int')
	quantity: number;

	@Column('decimal')
	price: number;
}
