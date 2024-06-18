import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../database/entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItem } from '../database/entities/order-item.entity';
import { Product } from 'src/database/entities/product.entity';
import { Customer } from 'src/database/entities/customer.entity';
import { UpdateOrderDto } from './dto/update-order.dto';

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

	async findAll(): Promise<Order[]> {
		return this.ordersRepository.find({
			relations: ['customer', 'orderItems', 'orderItems.product'],
		});
	}

	async findOne(id: string): Promise<Order> {
		const order = await this.ordersRepository.findOne({
			where: { id },
			relations: ['customer', 'orderItems', 'orderItems.product'],
		});

		if (!order) {
			throw new NotFoundException(`Order with ID '${id}' not found`);
		}

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
			return this.ordersRepository.save(existingOrder);
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
		return this.ordersRepository.save(order);
	}

	async removeOrderItem(
		orderId: string,
		orderItemId: string,
	): Promise<Order> {
		const order = await this.findOne(orderId);
		const orderItem = order.orderItems.find(
			(item) => item.id === orderItemId,
		);

		if (!orderItem) {
			throw new NotFoundException(
				`Order item with ID '${orderItemId}' not found in order`,
			);
		}

		order.orderItems = order.orderItems.filter(
			(item) => item.id !== orderItemId,
		);
		order.total -= orderItem.quantity * orderItem.price;
		return this.ordersRepository.save(order);
	}
}
