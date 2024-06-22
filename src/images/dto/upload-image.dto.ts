import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UploadImageDto {
	@ApiProperty({
		description: 'ID of the product',
		type: 'string',
	})
	@IsString()
	@IsNotEmpty()
	productId: string;

	@ApiProperty({
		description: 'File to upload',
		type: 'string',
		format: 'binary',
	})
	file: any;
}
