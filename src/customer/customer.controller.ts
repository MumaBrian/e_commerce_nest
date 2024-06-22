import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Patch,
	Delete,
	UseGuards,
	Query,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/enums/user-role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('customers')
@Controller('customers')
export class CustomerController {
	constructor(private readonly customerService: CustomerService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('authenticationToken')
	@Roles(UserRole.Customer, UserRole.Admin)
	async create(@Body() createCustomerDto: CreateCustomerDto) {
		return await this.customerService.create(createCustomerDto);
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	async findAll(
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
	) {
		return await this.customerService.findAll(page, limit);
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Customer, UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	async findOne(@Param('id') id: string) {
		return await this.customerService.findOne(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Customer, UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	async update(
		@Param('id') id: string,
		@Body() updateCustomerDto: UpdateCustomerDto,
	) {
		return await this.customerService.update(id, updateCustomerDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	async remove(@Param('id') id: string) {
		return await this.customerService.remove(id);
	}

	@Get('products/browse')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Customer)
	@ApiBearerAuth('authenticationToken')
	async browseProducts() {
		return await this.customerService.browseProducts();
	}

	@Get('products/:id')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Customer)
	@ApiBearerAuth('authenticationToken')
	async viewProduct(@Param('id') id: string) {
		return await this.customerService.viewProduct(id);
	}

	@Post('orders')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Customer)
	@ApiBearerAuth('authenticationToken')
	async placeOrder(@Body() orderDetails: any) {
		return await this.customerService.placeOrder(orderDetails);
	}

	@Get('orders')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Customer)
	@ApiBearerAuth('authenticationToken')
	async viewOrders(@Param('userId') userId: string) {
		return await this.customerService.viewOrders(userId);
	}

	@Get('receipts/:orderId')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Customer)
	@ApiBearerAuth('authenticationToken')
	async viewReceipt(@Param('orderId') orderId: string) {
		return await this.customerService.viewReceipt(orderId);
	}

	@Patch(':id/details')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Customer)
	@ApiBearerAuth('authenticationToken')
	async updateDetails(
		@Param('id') id: string,
		@Body() updateCustomerDto: UpdateCustomerDto,
	) {
		return await this.customerService.updateDetails(id, updateCustomerDto);
	}
}
