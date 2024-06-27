import {
	IsString,
	IsEmail,
	IsNotEmpty,
	IsEnum,
	IsOptional,
} from 'class-validator';
import { UserRole } from 'src/database/enums/user-role.enum';

export class CreateUserDto {
	@IsString()
	@IsNotEmpty()
	username: string;

	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	@IsNotEmpty()
	@IsOptional()
	password?: string;

	@IsEnum(UserRole)
	role: UserRole;

	@IsString()
	@IsNotEmpty()
	otp: string;
}
