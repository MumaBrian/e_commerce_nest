import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	OneToMany,
} from 'typeorm';
import { Category } from './category.entity';
import { OrderItem } from './order-item.entity';
import { Warranty } from './warranty.entity';
import { Image } from './image.entity';

@Entity()
export class Product {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	name: string;

	@Column()
	description: string;

	@Column('decimal')
	price: number;

	@Column()
	stock: number;

	@ManyToOne(() => Category, (category) => category.products)
	category: Category;

	@OneToMany(() => Image, (image) => image.product, {
		cascade: true,
		onDelete: 'CASCADE',
	})
	images: Image[];

	@OneToMany(() => OrderItem, (orderItem) => orderItem.product)
	orderItems: OrderItem[];

	@OneToMany(() => Warranty, (warranty) => warranty.product)
	warranties: Warranty[];
}
