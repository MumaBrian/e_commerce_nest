import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from 'src/database/enums/user-role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
	@IsString()
	@IsOptional()
	username?: string;

	@IsEmail()
	@IsOptional()
	email?: string;

	@IsString()
	@IsOptional()
	password?: string;

	@IsString()
	@IsOptional()
	@IsEnum(UserRole)
	role: UserRole;
}
