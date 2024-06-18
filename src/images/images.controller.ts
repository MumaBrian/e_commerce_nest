import {
	Controller,
	Get,
	Post,
	Param,
	Delete,
	Body,
	UseGuards,
	Patch,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/enums/user-role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';

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
}
