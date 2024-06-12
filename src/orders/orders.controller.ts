import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Patch,
	Delete,
	UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/enums/user-role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Customer, UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	async create(@Body() createOrderDto: CreateOrderDto) {
		return this.ordersService.create(createOrderDto);
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	async findAll() {
		return this.ordersService.findAll();
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	async findOne(@Param('id') id: string) {
		return this.ordersService.findOne(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin, UserRole.Customer)
	@ApiBearerAuth('authenticationToken')
	async update(
		@Param('id') id: string,
		@Body() updateOrderDto: CreateOrderDto,
	) {
		return this.ordersService.update(id, updateOrderDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin, UserRole.Customer)
	@ApiBearerAuth('authenticationToken')
	async remove(@Param('id') id: string) {
		return this.ordersService.remove(id);
	}
}
