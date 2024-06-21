import {
	Controller,
	Get,
	Post,
	Param,
	Delete,
	Body,
	UseGuards,
	Patch,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/enums/user-role.enum';
import {
	ApiBearerAuth,
	ApiTags,
	ApiResponse,
	ApiOperation,
	ApiConsumes,
	ApiBody,
} from '@nestjs/swagger';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadImageDto } from './dto/upload-image.dto';

@ApiTags('images')
@Controller('images')
@UseGuards(JwtAuthGuard)
export class ImagesController {
	constructor(private readonly imagesService: ImagesService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	async create(@Body() createImageDto: CreateImageDto) {
		return await this.imagesService.create(createImageDto);
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	async findAll() {
		return await this.imagesService.findAll();
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	async findOne(@Param('id') id: string) {
		return await this.imagesService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
		return this.imagesService.update(id, updateImageDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	async remove(@Param('id') id: string) {
		return await this.imagesService.remove(id);
	}

	@Post('upload')
	@Roles(UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	@ApiOperation({ summary: 'Upload an image or file for a product' })
	@ApiResponse({ status: 201, description: 'File uploaded successfully' })
	@ApiResponse({ status: 400, description: 'Bad Request' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		description: 'File to upload',
		type: UploadImageDto,
		schema: {
			type: 'object',
			properties: {
				file: {
					type: 'string',
					format: 'binary',
				},
				productId: {
					type: 'string',
				},
			},
		},
	})
	@UseInterceptors(
		FileInterceptor('file', {
			storage: memoryStorage(),
		}),
	)
	async uploadImage(
		@UploadedFile() file: Express.Multer.File,
		@Body() uploadImageDto: UploadImageDto,
	) {
		console.log('Uploaded file:', file);
		return this.imagesService.uploadImage(file, uploadImageDto.productId);
	}
}
