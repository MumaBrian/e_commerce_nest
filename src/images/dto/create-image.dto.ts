import { IsString, IsNotEmpty } from 'class-validator';

export class CreateImageDto {
	@IsString()
	@IsNotEmpty()
	url: string;
}
