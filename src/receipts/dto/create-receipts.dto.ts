import { IsString, IsNotEmpty } from 'class-validator';

export class CreateReceiptsDto {
	@IsString()
	@IsNotEmpty()
	orderId: string;

	@IsString()
	@IsNotEmpty()
	paymentId: string;

	@IsNotEmpty()
	date: Date;

	@IsString()
	@IsNotEmpty()
	warrantyId: string;
}
