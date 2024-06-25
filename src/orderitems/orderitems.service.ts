import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from '../database/entities/order-item.entity';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { Order } from '../database/entities/order.entity';
import { Product } from '../database/entities/product.entity';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class OrderItemService {
	private readonly logger = new Logger(OrderItemService.name);

	constructor(
		@InjectRepository(OrderItem)
		private orderItemsRepository: Repository<OrderItem>,
		@InjectRepository(Order)
		private ordersRepository: Repository<Order>,
		@InjectRepository(Product)
		private productsRepository: Repository<Product>,
		private cacheService: CacheService,
	) {}

	async addItem(productId: string, createOrderItemDto: CreateOrderItemDto) {
		const { quantity, price } = createOrderItemDto;

		const product = await this.productsRepository.findOne({
			where: { id: productId },
		});

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
			price: Number(product.price),
		});

		await this.orderItemsRepository.save(orderItem);

		await this.cacheService.del(`order-item:getItem:${orderItem.id}`);
		await this.cacheService.del('order-item:getAllItems');

		return orderItem;
	}

	async updateItem(id: string, updateOrderItemDto: UpdateOrderItemDto) {
		const orderItem = await this.orderItemsRepository.findOne({
			where: { id },
		});
		if (!orderItem) {
			throw new HttpException(
				'Order item not found',
				HttpStatus.NOT_FOUND,
			);
		}

		const updatedOrderItem = Object.assign(orderItem, updateOrderItemDto);

		await this.orderItemsRepository.save(updatedOrderItem);

		await this.updateOrderTotal(orderItem.order.id);

		await this.cacheService.del(`order-item:getItem:${orderItem.id}`);
		await this.cacheService.del('order-item:getAllItems');

		return updatedOrderItem;
	}

	async deleteItem(id: string) {
		const orderItem = await this.orderItemsRepository.findOne({
			where: { id },
		});
		if (!orderItem) {
			throw new HttpException(
				'Order item not found',
				HttpStatus.NOT_FOUND,
			);
		}

		const deletedOrderItem = await this.orderItemsRepository.delete(id);

		await this.updateOrderTotal(orderItem.order.id);

		await this.cacheService.del(`order-item:getItem:${orderItem.id}`);
		await this.cacheService.del('order-item:getAllItems');

		return deletedOrderItem;
	}

	async getItem(id: string) {
		const cacheKey = `order-item:getItem:${id}`;
		const cachedOrderItem = await this.cacheService.get(cacheKey);

		if (cachedOrderItem) {
			this.logger.log(`Cache hit for order item with ID: ${id}`);
			return JSON.parse(cachedOrderItem);
		}

		const orderItem = await this.orderItemsRepository.findOne({
			where: { id },
			relations: ['product', 'order'],
		});
		if (!orderItem) {
			throw new HttpException(
				'Order item not found',
				HttpStatus.NOT_FOUND,
			);
		}

		await this.cacheService.set(cacheKey, JSON.stringify(orderItem), 3600);
		this.logger.log(`Cache miss for order item with ID: ${id}`);

		return orderItem;
	}

	async getAllItems(page: number = 1, limit: number = 10) {
		const cacheKey = `order-item:getAllItems:${page}:${limit}`;
		const cachedItems = await this.cacheService.get(cacheKey);

		if (cachedItems) {
			this.logger.log(
				`Cache hit for all order items: page ${page}, limit ${limit}`,
			);
			return JSON.parse(cachedItems);
		}

		const skip = (page - 1) * limit;
		const [items, totalItems] =
			await this.orderItemsRepository.findAndCount({
				relations: ['product', 'order'],
				skip,
				take: limit,
			});

		const result = {
			items,
			totalItems,
			totalPages: Math.ceil(totalItems / limit),
			currentPage: page,
		};

		await this.cacheService.set(cacheKey, JSON.stringify(result), 3600);
		this.logger.log(
			`Cache miss for all order items: page ${page}, limit ${limit}`,
		);

		return result;
	}

	private async updateOrderTotal(orderId: string) {
		const order = await this.ordersRepository.findOne({
			where: { id: orderId },
		});
		if (!order) {
			throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
		}

		const orderItems = await this.orderItemsRepository.find({
			where: { order: { id: order.id } },
		});
		order.total = orderItems.reduce((sum, item) => sum + item.price, 0);
		await this.ordersRepository.save(order);
	}
}
