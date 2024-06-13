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
import { Image } from 'src/database/entities/image.entity';
@Injectable()
export class ProductsService {
	constructor(
		@InjectRepository(Product)
		private productsRepository: Repository<Product>,
		@InjectRepository(Category)
		private categoriesRepository: Repository<Category>,
		@InjectRepository(Category)
		private imagesRepository: Repository<Image>,
	) {}

	async create(createProductDto: CreateProductDto): Promise<Product> {
		const {
			category: categoryName,
			images: imageUrls,
			...productData
		} = createProductDto;

		const category = await this.categoriesRepository.findOne({
			where: { name: categoryName },
		});
		if (!category) {
			throw new BadRequestException(
				`Category '${categoryName}' does not exist`,
			);
		}

		const images = imageUrls.map((url) =>
			this.imagesRepository.create({ url }),
		);

		const product = this.productsRepository.create({
			...productData,
			category,
			images,
		});

		return this.productsRepository.save(product);
	}

	async findAll(): Promise<Product[]> {
		return this.productsRepository.find({ relations: ['category'] });
	}

	async findOne(id: string): Promise<Product> {
		const product = await this.productsRepository.findOne({
			where: { id },
			relations: ['category'],
		});

		if (!product) {
			throw new NotFoundException(`Product with ID '${id}' not found`);
		}

		return product;
	}

	async update(
		id: string,
		updateProductDto: UpdateProductDto,
	): Promise<Product> {
		const { category: categoryName, ...productData } = updateProductDto;

		const existingProduct = await this.productsRepository.findOne({
			where: { id },
		});
		if (!existingProduct) {
			throw new NotFoundException(`Product with ID '${id}' not found`);
		}

		let category: Category | undefined;
		if (categoryName) {
			category = await this.categoriesRepository.findOne({
				where: { name: categoryName },
			});
			if (!category) {
				throw new BadRequestException(
					`Category '${categoryName}' does not exist`,
				);
			}
		}

		await this.productsRepository.update(id, {
			...productData,
			category,
		});

		return this.productsRepository.findOne({
			where: { id },
			relations: ['category'],
		});
	}

	async remove(id: string): Promise<{ message: string }> {
		const existingProduct = await this.productsRepository.findOne({
			where: { id },
		});
		if (!existingProduct) {
			throw new NotFoundException(`Product with ID '${id}' not found`);
		}

		await this.productsRepository.delete(id);
		return { message: `Product with ID '${id}' deleted successfully` };
	}
}
