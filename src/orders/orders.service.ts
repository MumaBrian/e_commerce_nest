import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Order } from '../database/entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItem } from '../database/entities/order-item.entity';
import { Product } from 'src/database/entities/product.entity';
import { Customer } from 'src/database/entities/customer.entity';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class OrdersService {
	constructor(
		@InjectRepository(Order)
		private ordersRepository: Repository<Order>,
		@InjectRepository(OrderItem)
		private orderItemsRepository: Repository<OrderItem>,
		@InjectRepository(Product)
		private productsRepository: Repository<Product>,
		@InjectRepository(Customer)
		private customersRepository: Repository<Customer>,
		private cacheService: CacheService,
	) {}

	async create(createOrderDto: CreateOrderDto): Promise<Order> {
		const { customerId, orderItemsId, orderStatus, paymentMethod } =
			createOrderDto;

		try {
			const customer = await this.customersRepository.findOne({
				where: { id: customerId },
			});
			if (!customer) {
				throw new NotFoundException('Customer not found');
			}

			const existingOrder = await this.ordersRepository.findOne({
				where: { customer: { id: customerId } },
			});
			if (existingOrder) {
				throw new ConflictException(
					'An order already exists for this customer',
				);
			}

			const orderItems =
				await this.orderItemsRepository.findByIds(orderItemsId);
			if (orderItems.length !== orderItemsId.length) {
				throw new NotFoundException('Some order items not found');
			}

			const total = orderItems.reduce(
				(sum, item) => sum + item.quantity * item.price,
				0,
			);

			const order = this.ordersRepository.create({
				customer,
				orderItems,
				total,
				status: orderStatus,
				paymentMethod,
			});

			await this.ordersRepository.save(order);
			await this.cacheService.del('orders:all');

			return order;
		} catch (error) {
			if (
				error instanceof ConflictException ||
				error instanceof NotFoundException
			) {
				throw error;
			}
			throw new ConflictException('Error creating order');
		}
	}

	async findAll(page: number = 1, limit: number = 10): Promise<Order[]> {
		const cacheKey = `orders:all:${page}:${limit}`;
		const cachedOrders = await this.cacheService.get(cacheKey);

		if (cachedOrders) {
			return JSON.parse(cachedOrders);
		}

		const options: FindManyOptions<Order> = {
			relations: ['customer', 'orderItems', 'orderItems.product'],
			take: limit,
			skip: (page - 1) * limit,
		};

		const orders = await this.ordersRepository.find(options);

		await this.cacheService.set(cacheKey, JSON.stringify(orders));

		return orders;
	}

	async findOne(id: string): Promise<Order> {
		const cacheKey = `order:${id}`;
		const cachedOrder = await this.cacheService.get(cacheKey);

		if (cachedOrder) {
			return JSON.parse(cachedOrder);
		}

		const order = await this.ordersRepository.findOne({
			where: { id },
			relations: ['customer', 'orderItems', 'orderItems.product'],
		});

		if (!order) {
			throw new NotFoundException(`Order with ID '${id}' not found`);
		}

		await this.cacheService.set(cacheKey, JSON.stringify(order));

		return order;
	}

	async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
		try {
			const existingOrder = await this.ordersRepository.findOne({
				where: { id },
				relations: ['orderItems'],
			});
			if (!existingOrder) {
				throw new NotFoundException(`Order with ID '${id}' not found`);
			}

			if (updateOrderDto.ItemsId && updateOrderDto.ItemsId.length > 0) {
				const orderItems = await this.orderItemsRepository.findByIds(
					updateOrderDto.ItemsId,
				);
				if (orderItems.length !== updateOrderDto.ItemsId.length) {
					throw new NotFoundException('Some order items not found');
				}

				const total = orderItems.reduce(
					(sum, item) => sum + item.quantity * item.price,
					0,
				);
				updateOrderDto.total = total;
				existingOrder.orderItems = orderItems;
			}

			Object.assign(existingOrder, updateOrderDto);
			await this.ordersRepository.save(existingOrder);

			await this.cacheService.del(`order:${id}`);
			await this.cacheService.del('orders:all');

			return existingOrder;
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new ConflictException('Error updating order');
		}
	}

	async remove(id: string): Promise<void> {
		const order = await this.ordersRepository.findOne({ where: { id } });

		if (!order) {
			throw new NotFoundException(`Order with ID '${id}' not found`);
		}

		await this.ordersRepository.delete(id);
		await this.cacheService.del(`order:${id}`);
		await this.cacheService.del('orders:all');
	}

	async addOrderItem(orderId: string, orderItemId: string): Promise<Order> {
		const order = await this.findOne(orderId);
		const orderItem = await this.orderItemsRepository.findOne({
			where: { id: orderItemId },
		});

		if (!orderItem) {
			throw new NotFoundException(
				`Order item with ID '${orderItemId}' not found`,
			);
		}

		order.orderItems.push(orderItem);
		order.total += orderItem.quantity * orderItem.price;

		await this.ordersRepository.save(order);
		await this.cacheService.del(`order:${orderId}`);
		await this.cacheService.del('orders:all');

		return order;
	}

	async removeOrderItem(
		orderId: string,
		orderItemId: string,
	): Promise<Order> {
		const order = await this.findOne(orderId);
		const orderItemIndex = order.orderItems.findIndex(
			(item) => item.id === orderItemId,
		);

		if (orderItemIndex === -1) {
			throw new NotFoundException(
				`Order item with ID '${orderItemId}' not found in order`,
			);
		}

		const orderItem = order.orderItems[orderItemIndex];
		order.orderItems.splice(orderItemIndex, 1);
		order.total -= orderItem.quantity * orderItem.price;

		await this.ordersRepository.save(order);
		await this.cacheService.del(`order:${orderId}`);
		await this.cacheService.del('orders:all');

		return order;
	}
}
