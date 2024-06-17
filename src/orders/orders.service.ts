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

	async create(createOrderDto: CreateOrderDto) {
		const { customerId, orderItemsId, orderStatus, paymentMethod } =
			createOrderDto;

		// Check if any order already exists for the current customer
		const existingOrder = await this.ordersRepository.findOne({
			where: { customer: { id: customerId } },
		});
		if (existingOrder) {
			throw new ConflictException(
				'An order already exists for this customer, go ahead and edit the order',
			);
		}

		const customer = await this.customersRepository.findOne({
			where: { id: customerId },
		});
		if (!customer) {
			throw new NotFoundException('Customer not found');
		}

		const orderItems =
			await this.orderItemsRepository.findByIds(orderItemsId);
		if (orderItems.length !== orderItemsId.length) {
			throw new NotFoundException('No order item found');
		}

		const total = orderItems.reduce(
			(sum, item) => sum + item.quantity * item.price,
			0,
		);

		const order = new Order();
		order.customer = customer;
		order.OrderItems = orderItems;
		order.total = total;
		order.status = orderStatus;
		order.paymentMethod = paymentMethod;

		await this.ordersRepository.save(order);

		return order;
	}

	async findAll(): Promise<Order[]> {
		return this.ordersRepository.find({
			relations: ['customer', 'items', 'items.product'],
		});
	}

	async findOne(id: string): Promise<Order> {
		const order = await this.ordersRepository.findOne({
			where: { id },
			relations: ['customer', 'items', 'items.product'],
		});

		if (!order) {
			throw new NotFoundException(`Order with ID '${id}' not found`);
		}

		return order;
	}

	async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
		const existingOrder = await this.ordersRepository.findOne({
			where: { id },
		});
		if (!existingOrder) {
			throw new NotFoundException(`Order with ID '${id}' not found`);
		}

		const updatedOrder = Object.assign(existingOrder, updateOrderDto);
		return this.ordersRepository.save(updatedOrder);
	}

	async remove(id: string): Promise<void> {
		const order = await this.ordersRepository.findOne({ where: { id } });

		if (!order) {
			throw new NotFoundException(`Order with ID '${id}' not found`);
		}

		await this.ordersRepository.delete(id);
	}
}
