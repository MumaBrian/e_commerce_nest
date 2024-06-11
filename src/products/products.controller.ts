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

	// @Post()
	// @UseGuards(JwtAuthGuard)
	// @Roles(UserRole.Admin)
	// @ApiBearerAuth('authenticationToken')
	// create(@Body() createProductDto: CreateProductDto) {
	// 	return this.productsService.create(createProductDto);
	// }

	@Get()
	@ApiBearerAuth('authenticationToken')
	findAll() {
		return this.productsService.findAll();
	}

	@Get(':id')
	@ApiBearerAuth('authenticationToken')
	findOne(@Param('id') id: string) {
		return this.productsService.findOne(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	update(
		@Param('id') id: string,
		@Body() updateProductDto: UpdateProductDto,
	) {
		return this.productsService.update(id, updateProductDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	remove(@Param('id') id: string) {
		return this.productsService.remove(id);
	}
}
