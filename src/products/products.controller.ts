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
import { Role } from '../database/entities/role.enum';

@Controller('products')
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	@Roles(Role.Admin)
	create(@Body() createProductDto: CreateProductDto) {
		return this.productsService.create(createProductDto);
	}

	@Get()
	findAll() {
		return this.productsService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.productsService.findOne(+id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(Role.Admin)
	update(
		@Param('id') id: string,
		@Body() updateProductDto: UpdateProductDto,
	) {
		return this.productsService.update(+id, updateProductDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(Role.Admin)
	remove(@Param('id') id: string) {
		return this.productsService.remove(+id);
	}
}
