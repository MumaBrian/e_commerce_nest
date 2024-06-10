import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../database/entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
	constructor(
		@InjectRepository(Order)
		private ordersRepository: Repository<Order>,
	) {}

	async create(createOrderDto: CreateOrderDto): Promise<Order> {
		if (!createOrderDto.itemsId || createOrderDto.itemsId.length === 0) {
			throw new BadRequestException('Order items must be provided');
		}

		for (const item of createOrderDto.itemsId) {
			if (item.length === 0) {
				throw new BadRequestException('Invalid order item');
			}
		}

		if (!createOrderDto.customerId) {
			throw new BadRequestException('Customer ID must be provided');
		}

		const existingOrder = await this.ordersRepository.findOne({
			where: { customer: { id: createOrderDto.customerId } },
		});

		if (existingOrder) {
			throw new BadRequestException(
				`Order for customer ID '${createOrderDto.customerId}' already exists`,
			);
		}

		const order = this.ordersRepository.create(createOrderDto);
		return this.ordersRepository.save(order);
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
