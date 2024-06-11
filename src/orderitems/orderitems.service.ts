import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from '../database/entities/order-item.entity';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { Order } from '../database/entities/order.entity';
import { Product } from '../database/entities/product.entity';

@Injectable()
export class OrderItemService {
	constructor(
		@InjectRepository(OrderItem)
		private orderItemsRepository: Repository<OrderItem>,
		@InjectRepository(Order)
		private ordersRepository: Repository<Order>,
		@InjectRepository(Product)
		private productsRepository: Repository<Product>,
	) {}

	async addItem(orderId: string, createOrderItemDto: CreateOrderItemDto) {
		const { productId, quantity, price } = createOrderItemDto;
		const order = await this.ordersRepository.findOne({
			where: { id: orderId },
		});
		const product = await this.productsRepository.findOne({
			where: { id: productId },
		});

		if (!order || !product) {
			throw new Error('Order or Product not found');
		}

		const orderItem = this.orderItemsRepository.create({
			order,
			product,
			quantity,
			price,
		});

		await this.orderItemsRepository.save(orderItem);

		// Update order total
		order.total += price;
		await this.ordersRepository.save(order);

		return orderItem;
	}

	async updateItem(id: string, updateOrderItemDto: UpdateOrderItemDto) {
		const orderItem = await this.orderItemsRepository.findOne({
			where: { id },
		});
		if (!orderItem) {
			throw new Error('Order item not found');
		}

		const updatedOrderItem = Object.assign(orderItem, updateOrderItemDto);

		await this.orderItemsRepository.save(updatedOrderItem);

		// Update order total
		const order = await this.ordersRepository.findOne({
			where: { id: orderItem.order.id },
		});
		if (!order) {
			throw new Error('Order not found');
		}

		const orderItems = await this.orderItemsRepository.find({
			where: { order: { id: order.id } },
		});
		order.total = orderItems.reduce((sum, item) => sum + item.price, 0);
		await this.ordersRepository.save(order);

		return updatedOrderItem;
	}

	async deleteItem(id: string) {
		const orderItem = await this.orderItemsRepository.findOne({
			where: { id },
		});
		if (!orderItem) {
			throw new Error('Order item not found');
		}

		await this.orderItemsRepository.delete(id);

		// Update order total
		const order = await this.ordersRepository.findOne({
			where: { id: orderItem.order.id },
		});
		if (!order) {
			throw new Error('Order not found');
		}

		const orderItems = await this.orderItemsRepository.find({
			where: { order: { id: order.id } },
		});
		order.total = orderItems.reduce((sum, item) => sum + item.price, 0);
		await this.ordersRepository.save(order);

		return orderItem;
	}
}
