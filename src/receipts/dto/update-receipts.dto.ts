import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateReceiptsDto {
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	orderId?: string;

	@IsString()
	@IsNotEmpty()
	@IsOptional()
	paymentId?: string;

	@IsNotEmpty()
	@IsOptional()
	date?: Date;

	@IsString()
	@IsNotEmpty()
	@IsOptional()
	warrantyId?: string;
}
