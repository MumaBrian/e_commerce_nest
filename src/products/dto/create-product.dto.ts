import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateProductDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	description: string;

	@IsNumber()
	@IsNotEmpty()
	price: number;

	@IsNumber()
	@IsNotEmpty()
	stock: number;

	@IsString()
	@IsNotEmpty()
	imageId: string;

	@IsString()
	@IsNotEmpty()
	category: string;
}
