import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePaymentDto {
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	orderId?: string;
}
