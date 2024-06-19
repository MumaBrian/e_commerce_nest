import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateImageDto {
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	url: string;
}
