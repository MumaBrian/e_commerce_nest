import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateProductDto {
	@IsString()
	@IsOptional()
	name?: string;

	@IsString()
	@IsOptional()
	description?: string;

	@IsNumber()
	@IsOptional()
	price?: number;

	@IsNumber()
	@IsOptional()
	stock?: number;

	@IsString()
	@IsOptional()
	category?: string;
}
