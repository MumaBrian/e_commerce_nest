import {
	IsString,
	IsEmail,
	IsNotEmpty,
	IsEnum,
	IsStrongPassword,
} from 'class-validator';
import { UserRole } from 'src/database/enums/user-role.enum';
export class RegisterDto {
	@IsString()
	@IsNotEmpty()
	username: string;

	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsStrongPassword()
	password: string;

	@IsEnum(UserRole)
	role: UserRole;
}
