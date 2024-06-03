import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../database/entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Product } from '../database/entities/product.entity';
import { Order } from '../database/entities/order.entity';

@Injectable()
export class CustomerService {
	constructor(
		@InjectRepository(Customer)
		private customersRepository: Repository<Customer>,
		@InjectRepository(Product)
		private productsRepository: Repository<Product>,
		@InjectRepository(Order)
		private ordersRepository: Repository<Order>,
	) {}

	async create(createCustomerDto: CreateCustomerDto) {
		try {
			const customer = this.customersRepository.create(createCustomerDto);
			return await this.customersRepository.save(customer);
		} catch (error) {
			throw new BadRequestException('Failed to create customer');
		}
	}

	async findAll() {
		try {
			return await this.customersRepository.find();
		} catch (error) {
			throw new BadRequestException('Failed to fetch customers');
		}
	}

	async findOne(id: string) {
		try {
			const customer = await this.customersRepository.findOne({
				where: { id },
				relations: ['user'],
			});

			if (!customer) {
				throw new NotFoundException(`Customer with ID ${id} not found`);
			}

			return customer;
		} catch (error) {
			throw new BadRequestException(
				`Failed to fetch customer with ID ${id}`,
			);
		}
	}

	async update(id: string, updateCustomerDto: UpdateCustomerDto) {
		try {
			const result = await this.customersRepository.update(
				id,
				updateCustomerDto,
			);

			if (result.affected === 0) {
				throw new NotFoundException(`Customer with ID ${id} not found`);
			}

			return this.findOne(id);
		} catch (error) {
			throw new BadRequestException(
				`Failed to update customer with ID ${id}`,
			);
		}
	}

	async remove(id: string) {
		try {
			const result = await this.customersRepository.delete(id);

			if (result.affected === 0) {
				throw new NotFoundException(`Customer with ID ${id} not found`);
			}
		} catch (error) {
			throw new BadRequestException(
				`Failed to delete customer with ID ${id}`,
			);
		}
	}

	async browseProducts() {
		try {
			return await this.productsRepository.find({
				relations: ['category', 'images'],
			});
		} catch (error) {
			throw new BadRequestException('Failed to fetch products');
		}
	}

	async viewProduct(id: string) {
		try {
			const product = await this.productsRepository.findOne({
				where: { id },
				relations: ['category', 'images'],
			});

			if (!product) {
				throw new NotFoundException(`Product with ID ${id} not found`);
			}

			return product;
		} catch (error) {
			throw new BadRequestException(
				`Failed to fetch product with ID ${id}`,
			);
		}
	}

	async placeOrder(orderDetails: any) {
		try {
			const order = this.ordersRepository.create(orderDetails);
			return await this.ordersRepository.save(order);
		} catch (error) {
			throw new BadRequestException('Failed to place order');
		}
	}

	async viewOrders(id: string) {
		try {
			const orders = await this.ordersRepository.find({
				where: { id },
				relations: ['items', 'items.product'],
			});

			if (!orders.length) {
				throw new NotFoundException(
					`No orders found for customer with ID ${id}`,
				);
			}

			return orders;
		} catch (error) {
			throw new BadRequestException(
				`Failed to fetch orders for customer with ID ${id}`,
			);
		}
	}

	async viewReceipt(orderId: string) {
		try {
			const order = await this.ordersRepository.findOne({
				where: { id: orderId },
				relations: ['payments', 'items', 'items.product'],
			});

			if (!order) {
				throw new NotFoundException(
					`Order with ID ${orderId} not found`,
				);
			}

			return order;
		} catch (error) {
			throw new BadRequestException(
				`Failed to fetch receipt for order with ID ${orderId}`,
			);
		}
	}

	async updateDetails(id: string, updateCustomerDto: UpdateCustomerDto) {
		try {
			const result = await this.customersRepository.update(
				id,
				updateCustomerDto,
			);

			if (result.affected === 0) {
				throw new NotFoundException(`Customer with ID ${id} not found`);
			}

			return this.findOne(id);
		} catch (error) {
			throw new BadRequestException(
				`Failed to update details for customer with ID ${id}`,
			);
		}
	}
}
