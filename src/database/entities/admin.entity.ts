import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Admin {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@OneToOne(() => User)
	@JoinColumn()
	user: User;
}
