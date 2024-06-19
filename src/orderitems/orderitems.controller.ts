import {
	Controller,
	Post,
	Body,
	Param,
	Patch,
	Delete,
	UseGuards,
	Get,
} from '@nestjs/common';
import { OrderItemService } from './orderitems.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserRole } from 'src/database/enums/user-role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('order-items')
@Controller('order-items')
export class OrderItemController {
	constructor(private readonly orderItemService: OrderItemService) {}

	@Post(':productId')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Customer, UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	addItem(
		@Param('productId') productId: string,
		@Body() createOrderItemDto: CreateOrderItemDto,
	) {
		return this.orderItemService.addItem(productId, createOrderItemDto);
	}

	@Get(':id')
	async getItem(@Param('id') id: string) {
		return await this.orderItemService.getItem(id);
	}

	@Get()
	async getAllItems() {
		return await this.orderItemService.getAllItems();
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Customer, UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	updateItem(
		@Param('id') id: string,
		@Body() updateOrderItemDto: UpdateOrderItemDto,
	) {
		return this.orderItemService.updateItem(id, updateOrderItemDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Customer, UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	deleteItem(@Param('id') id: string) {
		return this.orderItemService.deleteItem(id);
	}
}
