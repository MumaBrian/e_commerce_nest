import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/enums/user-role.enum';
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiTags("categories")
@Controller('categories')
export class CategoriesController {
	constructor(private readonly categoriesService: CategoriesService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin)
	@ApiBearerAuth("authenticationToken")
	create(@Body() createCategoryDto: CreateCategoryDto) {
		return this.categoriesService.create(createCategoryDto);
	}

	@Get()
	@ApiBearerAuth("authenticationToken")
	findAll() {
		return this.categoriesService.findAll();
	}

	@Get(':id')
	@ApiBearerAuth("authenticationToken")
	findOne(@Param('id') id: string) {
		return this.categoriesService.findOne(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin)
	@ApiBearerAuth("authenticationToken")
	update(
		@Param('id') id: string,
		@Body() updateCategoryDto: UpdateCategoryDto,
	) {
		return this.categoriesService.update(id, updateCategoryDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin)
	@ApiBearerAuth("authenticationToken")
	remove(@Param('id') id: string) {
		return this.categoriesService.remove(id);
	}
}
