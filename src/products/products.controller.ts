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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/enums/user-role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	async create(@Body() createProductDto: CreateProductDto) {
		return await this.productsService.create(createProductDto);
	}

	@Get()
	@ApiBearerAuth('authenticationToken')
	async findAll() {
		return await this.productsService.findAll();
	}

	@Get(':id')
	@ApiBearerAuth('authenticationToken')
	async findOne(@Param('id') id: string) {
		return await this.productsService.findOne(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	async update(
		@Param('id') id: string,
		@Body() updateProductDto: UpdateProductDto,
	) {
		return await this.productsService.update(id, updateProductDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	async remove(@Param('id') id: string) {
		return await this.productsService.remove(id);
	}
}
