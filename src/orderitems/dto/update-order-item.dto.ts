import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateOrderItemDto {
	@IsString()
	@IsOptional()
	productId?: string;

	@IsNumber()
	@IsOptional()
	quantity?: number;

	@IsNumber()
	@IsOptional()
	price?: number;
}
