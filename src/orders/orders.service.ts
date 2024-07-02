import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Order } from '../database/entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItem } from '../database/entities/order-item.entity';
import { Product } from '../database/entities/product.entity';
import { Customer } from '../database/entities/customer.entity';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CacheService } from '../cache/cache.service';

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

	private async findCustomerById(customerId: string): Promise<Customer> {
		const customer = await this.customersRepository.findOne({
			where: { id: customerId },
		});
		if (!customer) throw new NotFoundException('Customer not found');
		return customer;
	}

	private async findOrderItemsByIds(
		orderItemsId: string[],
	): Promise<OrderItem[]> {
		const orderItems =
			await this.orderItemsRepository.findByIds(orderItemsId);
		if (orderItems.length !== orderItemsId.length)
			throw new NotFoundException('Some order items not found');
		return orderItems;
	}

	private calculateTotal(orderItems: OrderItem[]): number {
		return orderItems.reduce(
			(sum, item) => sum + item.quantity * item.price,
			0,
		);
	}

	private async updateCache(keys: string[]): Promise<void> {
		await Promise.all(keys.map((key) => this.cacheService.del(key)));
	}

	async create(createOrderDto: CreateOrderDto): Promise<Order> {
		const { customerId, orderItemsId, orderStatus, paymentMethod } =
			createOrderDto;

		const customer = await this.findCustomerById(customerId);
		const existingOrder = await this.ordersRepository.findOne({
			where: { customer: { id: customerId } },
		});
		if (existingOrder)
			throw new ConflictException(
				'An order already exists for this customer',
			);

		const orderItems = await this.findOrderItemsByIds(orderItemsId);
		const total = this.calculateTotal(orderItems);

		const order = this.ordersRepository.create({
			customer,
			orderItems,
			total,
			status: orderStatus,
			paymentMethod,
		});

		await this.ordersRepository.save(order);
		await this.updateCache(['orders:all']);

		return order;
	}

	async findAll(page: number = 1, limit: number = 10): Promise<Order[]> {
		const cacheKey = `orders:all:${page}:${limit}`;
		const cachedOrders = await this.cacheService.get(cacheKey);
		if (cachedOrders) return JSON.parse(cachedOrders);

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
		if (cachedOrder) return JSON.parse(cachedOrder);

		const order = await this.ordersRepository.findOne({
			where: { id },
			relations: ['customer', 'orderItems', 'orderItems.product'],
		});
		if (!order)
			throw new NotFoundException(`Order with ID '${id}' not found`);

		await this.cacheService.set(cacheKey, JSON.stringify(order));

		return order;
	}

	async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
		const existingOrder = await this.ordersRepository.findOne({
			where: { id },
			relations: ['orderItems'],
		});
		if (!existingOrder)
			throw new NotFoundException(`Order with ID '${id}' not found`);

		if (updateOrderDto.ItemsId?.length) {
			const orderItems = await this.findOrderItemsByIds(
				updateOrderDto.ItemsId,
			);
			updateOrderDto.total = this.calculateTotal(orderItems);
			existingOrder.orderItems = orderItems;
		}

		Object.assign(existingOrder, updateOrderDto);
		await this.ordersRepository.save(existingOrder);
		await this.updateCache([`order:${id}`, 'orders:all']);

		return existingOrder;
	}

	async remove(id: string): Promise<void> {
		const order = await this.ordersRepository.findOne({
			where: { id: id },
		});
		if (!order)
			throw new NotFoundException(`Order with ID '${id}' not found`);

		await this.ordersRepository.delete(id);
		await this.updateCache([`order:${id}`, 'orders:all']);
	}

	async addOrderItem(orderId: string, orderItemId: string): Promise<Order> {
		const [order, orderItem] = await Promise.all([
			this.findOne(orderId),
			this.orderItemsRepository.findOne({ where: { id: orderId } }),
		]);

		if (!orderItem)
			throw new NotFoundException(
				`Order item with ID '${orderItemId}' not found`,
			);

		order.orderItems.push(orderItem);
		order.total += orderItem.quantity * orderItem.price;

		await this.ordersRepository.save(order);
		await this.updateCache([`order:${orderId}`, 'orders:all']);

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
		if (orderItemIndex === -1)
			throw new NotFoundException(
				`Order item with ID '${orderItemId}' not found in order`,
			);

		const orderItem = order.orderItems[orderItemIndex];
		order.orderItems.splice(orderItemIndex, 1);
		order.total -= orderItem.quantity * orderItem.price;

		await this.ordersRepository.save(order);
		await this.updateCache([`order:${orderId}`, 'orders:all']);

		return order;
	}
}
