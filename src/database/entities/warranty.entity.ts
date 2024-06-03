import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class Warranty {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => Product, (product) => product.warranties)
	product: Product;

	@Column('int')
	period: number;

	@Column()
	startDate: Date;

	@Column()
	endDate: Date;

	@Column('text')
	details: string;
}
