import { Controller, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { OrderItemService } from './orderitems.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

@Controller('order-items')
export class OrderItemController {
	constructor(private readonly orderItemService: OrderItemService) {}

	@Post(':orderId')
	addItem(
		@Param('orderId') orderId: string,
		@Body() createOrderItemDto: CreateOrderItemDto,
	) {
		return this.orderItemService.addItem(orderId, createOrderItemDto);
	}

	@Patch(':id')
	updateItem(
		@Param('id') id: string,
		@Body() updateOrderItemDto: UpdateOrderItemDto,
	) {
		return this.orderItemService.updateItem(id, updateOrderItemDto);
	}

	@Delete(':id')
	deleteItem(@Param('id') id: string) {
		return this.orderItemService.deleteItem(id);
	}
}
