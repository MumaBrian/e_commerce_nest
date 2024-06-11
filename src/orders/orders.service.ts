import { Injectable, NotFoundException } from '@nestjs/common';
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
		const { customerId, items, orderStatus, paymentMethod } =
			createOrderDto;

		// Find the customer by ID
		const customer = await this.customersRepository.findOne({
			where: { id: customerId },
		});
		if (!customer) {
			throw new NotFoundException('Customer not found');
		}

		// Initialize order items and calculate the total price
		const orderItems: OrderItem[] = [];
		let total = 0;

		for (const item of items) {
			// Find the product by ID
			const product = await this.productsRepository.findOne({
				where: { id: item.productId },
			});
			if (!product) {
				throw new NotFoundException(
					`Product with ID '${item.productId}' not found`,
				);
			}

			// Create an order item
			const orderItem = new OrderItem();
			orderItem.product = product;
			orderItem.quantity = item.quantity;
			orderItem.price = item.price;

			// Add the order item to the list and update the total price
			total += orderItem.price;
			orderItems.push(orderItem);
		}

		// Create the order entity
		const order = new Order();
		order.customer = customer;
		order.items = orderItems;
		order.total = total;
		order.status = orderStatus;
		order.paymentMethod = paymentMethod;

		// Save the order to the database
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
