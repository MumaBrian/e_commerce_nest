import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateOrderItemDto {
	@IsNumber()
	@IsNotEmpty()
	quantity: number;

	@IsNumber()
	@IsNotEmpty()
	price: number;
}
