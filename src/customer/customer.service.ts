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
import { User } from 'src/database/entities/user.entity';

@Injectable()
export class CustomerService {
	constructor(
		@InjectRepository(Customer)
		private customersRepository: Repository<Customer>,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		@InjectRepository(Product)
		private productsRepository: Repository<Product>,
		@InjectRepository(Order)
		private ordersRepository: Repository<Order>,
	) {}

	async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
		const { userId } = createCustomerDto;

		const existingCustomer = await this.customersRepository.findOne({
			where: { user: { id: userId } },
			relations: ['user'],
		});

		if (existingCustomer) {
			throw new BadRequestException(
				`Customer with userId ${userId} already exists`,
			);
		}

		try {
			const user = await this.usersRepository.findOne({
				where: { id: userId },
			});
			if (!user) {
				throw new BadRequestException('Failed to create customer');
			}

			const newCustomer = this.customersRepository.create({
				user,
				...createCustomerDto,
			});

			const savedCustomer =
				await this.customersRepository.save(newCustomer);
			return savedCustomer;
		} catch (error) {
			throw new BadRequestException('Failed to create customer');
		}
	}

	async findAll(page: number, limit: number) {
		try {
			const [customers, total] =
				await this.customersRepository.findAndCount({
					skip: (page - 1) * limit,
					take: limit,
				});

			return {
				data: customers,
				total,
				page,
				lastPage: Math.ceil(total / limit),
			};
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

			return this.customersRepository.save(customer);
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
			console.error({ error });
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
			console.error({ error });
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
