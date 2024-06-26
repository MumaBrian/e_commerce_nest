import { IsString, IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
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
	password: string;

	@IsString()
	@IsEnum(UserRole)
	role: UserRole;
}
