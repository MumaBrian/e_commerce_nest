import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	OneToMany,
	BeforeInsert,
	BeforeUpdate,
} from 'typeorm';
import { Order } from './order.entity';
import { Role } from './role.enum';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	username: string;

	@Column()
	email: string;

	@Column()
	password: string;

	@Column({ type: 'enum', enum: Role, default: Role.Customer })
	roles: Role;

	@OneToMany(() => Order, (order) => order.user)
	orders: Order[];

	@BeforeInsert()
	@BeforeUpdate()
	async hashPassword() {
		if (this.password) {
			this.password = await bcrypt.hash(this.password, 10);
		}
	}
}
