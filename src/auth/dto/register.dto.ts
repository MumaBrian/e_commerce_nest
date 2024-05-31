import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export enum Status {
	PENDING = 'pending',
	ACTIVE = 'active',
}

export enum UserRole {
	USER = 'user',
	ADMIN = 'admin',
}

export class RegisterDto {
	@IsString()
	@IsNotEmpty()
	username: string;

	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	@IsNotEmpty()
	password: string;
}