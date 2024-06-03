import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToOne,
	JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Customer {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@OneToOne(() => User)
	@JoinColumn()
	user: User;

	@Column()
	address: string;

	@Column()
	phone: string;
}
