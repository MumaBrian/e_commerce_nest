import { IsString, IsNotEmpty, ArrayNotEmpty, IsArray } from 'class-validator';

export class CreateImageDto {
	@IsString()
	@IsNotEmpty()
	url: string;

	@IsArray()
	@ArrayNotEmpty()
	@IsString({ each: true })
	productId: string[];
}
