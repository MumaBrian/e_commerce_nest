import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class UpdateWarrantyDto {
	@IsString()
	@IsOptional()
	productId?: string;

	@IsNumber()
	@IsOptional()
	period?: number;

	@IsDateString()
	@IsOptional()
	startDate?: string;
}
