import {
	Injectable,
	NotFoundException,
	BadRequestException,
	InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../database/entities/payment.entity';
import { Order } from '../database/entities/order.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus } from '../database/enums/payment-status.enum';

@Injectable()
export class PaymentsService {
	constructor(
		@InjectRepository(Payment)
		private readonly paymentsRepository: Repository<Payment>,
		@InjectRepository(Order)
		private readonly ordersRepository: Repository<Order>,
	) {}

	async create(createPaymentDto: CreatePaymentDto) {
		const order = await this.findOrderById(createPaymentDto.orderId);

		this.validateOrderForPayment(order);

		const payment = this.createPaymentFromOrder(order);

		try {
			await this.paymentsRepository.save(payment);
		} catch (error) {
			throw new InternalServerErrorException(
				`Failed to save payment: ${error.message}`,
			);
		}

		return payment;
	}

	async findAll() {
		try {
			return await this.paymentsRepository.find();
		} catch (error) {
			throw new InternalServerErrorException(
				`Failed to fetch payments: ${error.message}`,
			);
		}
	}

	async findOne(id: string) {
		const payment = await this.paymentsRepository.findOne({
			where: { id },
			relations: ['order'],
		});

		if (!payment) {
			throw new NotFoundException(`Payment with id ${id} not found`);
		}

		return payment;
	}

	private async findOrderById(orderId: string): Promise<Order> {
		try {
			const order = await this.ordersRepository.findOne({
				where: { id: orderId },
			});
			if (!order) {
				throw new NotFoundException(
					`Order with id ${orderId} not found`,
				);
			}
			return order;
		} catch (error) {
			throw new InternalServerErrorException(
				`Failed to fetch order: ${error.message}`,
			);
		}
	}

	private validateOrderForPayment(order: Order) {
		if (!order.total || order.total <= 0) {
			throw new BadRequestException(
				'Order total must be greater than zero',
			);
		}
		if (!order.paymentMethod) {
			throw new BadRequestException(
				'Order must have a valid payment method',
			);
		}
		if (order.status !== 'pending') {
			throw new BadRequestException(
				'Order status must be pending to create a payment',
			);
		}
	}

	private createPaymentFromOrder(order: Order): Payment {
		return this.paymentsRepository.create({
			order,
			amount: order.total,
			method: order.paymentMethod,
			status: PaymentStatus.Completed,
		});
	}
}
