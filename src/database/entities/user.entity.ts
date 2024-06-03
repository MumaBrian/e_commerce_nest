import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	OneToMany,
	BeforeInsert,
	BeforeUpdate,
} from 'typeorm';
import { Order } from './order.entity';
import { UserRole } from '../enums/user-role.enum';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ unique: true })
	username: string;

	@Column({ unique: true })
	email: string;

	@Column()
	password: string;

	@Column({ type: 'enum', enum: UserRole, default: UserRole.Customer })
	roles: UserRole;

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
