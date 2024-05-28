import {
	IsString,
	IsNotEmpty,
	IsEmail,
	MinLength,
	IsEnum,
} from 'class-validator';

enum Status {
	PENDING = 'pending',
	ACTIVE = 'active',
	DEACTIVATED = 'deactivated',
}

enum Role {
	CUSTOMER = 'customer',
	ADMIN = 'admin',
}

export class SignupDto {
	@IsString()
	@IsNotEmpty()
	username: string;

	@IsEmail()
	email: string;

	@MinLength(8)
	@IsString()
	password: string;

	@IsString()
	@IsEnum(Status)
	status: string;

	@IsString()
	@IsEnum(Role)
	role: string;
}

export class VerifyOtpDto {
	@IsString()
	otp: string;

	@IsEmail()
	email: string;
}

export class SigninDto {
	@IsEmail()
	email: string;

	@IsString()
	password: string;
}
