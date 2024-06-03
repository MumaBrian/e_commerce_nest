import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../database/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from '../database/entities/category.entity';

@Injectable()
export class ProductsService {
	constructor(
		@InjectRepository(Product)
		private productsRepository: Repository<Product>,
		@InjectRepository(Category)
		private categoriesRepository: Repository<Category>,
	) {}

	async create(createProductDto: CreateProductDto) {
		const category = await this.categoriesRepository.findOne({
			where: { name: createProductDto.category },
		});

		if (!category) {
			throw new BadRequestException(
				`Category ${createProductDto.category} does not exist`,
			);
		}

		const product = this.productsRepository.create({
			...createProductDto,
			category,
		});

		return this.productsRepository.save(product);
	}

	findAll() {
		return this.productsRepository.find({ relations: ['category'] });
	}

	async findOne(id: string): Promise<Product> {
		const product = await this.productsRepository.findOne({
			where: { id },
			relations: ['category'],
		});

		if (!product) {
			throw new NotFoundException(`Product with ID ${id} not found`);
		}

		return product;
	}

	async update(id: string, updateProductDto: UpdateProductDto) {
		const existingProduct = await this.productsRepository.findOne({
			where: { id },
		});
		if (!existingProduct) {
			throw new NotFoundException(`Product with ID ${id} not found`);
		}

		const category = updateProductDto.category
			? await this.categoriesRepository.findOne({
					where: { name: updateProductDto.category },
				})
			: undefined;

		if (updateProductDto.category && !category) {
			throw new BadRequestException(
				`Category ${updateProductDto.category} does not exist`,
			);
		}

		await this.productsRepository.update(id, {
			...updateProductDto,
			category,
		});

		return this.productsRepository.findOne({
			where: { id },
			relations: ['category'],
		});
	}

	async remove(id: string) {
		const existingProduct = await this.productsRepository.findOne({
			where: { id },
		});
		if (!existingProduct) {
			throw new NotFoundException(`Product with ID ${id} not found`);
		}

		await this.productsRepository.delete(id);
		return { message: `Product with ID ${id} deleted successfully` };
	}
}
