import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';
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

	@Column({ type: 'enum', enum: UserRole })
	roles: UserRole;

	@BeforeInsert()
	async hashPassword() {
		if (this.password) {
			this.password = await bcrypt.hash(this.password, 10);
		}
	}
}
