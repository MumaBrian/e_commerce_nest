import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from '../enums/user-role.enum';

@Entity()
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ unique: true })
	username: string;

	@Column({ unique: true })
	email: string;

	@Column({ nullable: true })
	password: string;

	@Column({ nullable: true })
	otp: string;

	@Column({ nullable: true, type: 'timestamp' })
	otpCreatedAt: Date;

	@Column({ default: false })
	isVerified: boolean;

	@Column({ type: 'enum', enum: UserRole })
	roles: UserRole;

	@Column({ nullable: true })
	refreshToken?: string;

	@Column({ nullable: true })
	resetToken?: string;

	@Column({ type: 'timestamp', nullable: true })
	resetTokenExpiry?: Date;
}
