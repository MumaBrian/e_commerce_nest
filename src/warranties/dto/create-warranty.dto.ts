import { IsString, IsNumber, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateWarrantyDto {
	@IsString()
	@IsNotEmpty()
	productId: string;

	@IsNumber()
	@IsNotEmpty()
	period: number;

	@IsDateString()
	@IsNotEmpty()
	startDate: string;
}
