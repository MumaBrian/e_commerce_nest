import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateCustomerDto {
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	userId: string;

	@IsString()
	@IsOptional()
	address?: string;

	@IsString()
	@IsOptional()
	phone?: string;
}
