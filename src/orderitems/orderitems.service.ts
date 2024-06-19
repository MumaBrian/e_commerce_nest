import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

	async addItem(productId: string, createOrderItemDto: CreateOrderItemDto) {
		const { quantity, price } = createOrderItemDto;

		const product = await this.productsRepository.findOne({
			where: { id: productId },
		});

		console.log({ product });
		if (!product) {
			throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
		}

		if (quantity > product.stock) {
			throw new HttpException(
				'Insufficient stock',
				HttpStatus.BAD_REQUEST,
			);
		}

		if (Number(price) !== Number(product.price)) {
			throw new HttpException(
				'Price mismatch, enter the right price from the product',
				HttpStatus.BAD_REQUEST,
			);
		}

		const orderItem = this.orderItemsRepository.create({
			product,
			quantity,
			price: Number(product.price), // Ensure the price matches the product's price
		});

		console.log({ orderItem });
		await this.orderItemsRepository.save(orderItem);

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

	async getItem(id: string) {
		const orderItem = await this.orderItemsRepository.findOne({
			where: { id },
			relations: ['product', 'order'],
		});
		if (!orderItem) {
			throw new Error('Order item not found');
		}
		return orderItem;
	}

	async getAllItems() {
		return await this.orderItemsRepository.find({
			relations: ['product', 'order'],
		});
	}
}
