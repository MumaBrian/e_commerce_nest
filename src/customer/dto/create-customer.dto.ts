import { IsString, IsNotEmpty } from 'class-validator';
export class CreateCustomerDto {
	@IsString()
	@IsNotEmpty()
	userId: string;

	@IsString()
	address: string;

	@IsString()
	phone: string;
}
