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
		@InjectRepository(Image)
		private imageRepository: Repository<Image>,
	) {}

	private async findCategoryByName(name: string): Promise<Category> {
		const category = await this.categoriesRepository.findOne({
			where: { name },
		});
		if (!category) {
			throw new BadRequestException(`Category '${name}' does not exist`);
		}
		return category;
	}

	private async findImageById(id: string): Promise<Image> {
		const image = await this.imageRepository.findOne({ where: { id } });
		if (!image) {
			throw new BadRequestException(
				`Image with ID '${id}' does not exist`,
			);
		}
		return image;
	}

	async create(createProductDto: CreateProductDto): Promise<Product> {
		const {
			category: categoryName,
			imageId,
			...productData
		} = createProductDto;

		const category = await this.findCategoryByName(categoryName);
		const image = await this.findImageById(imageId);

		const product = this.productsRepository.create({
			...productData,
			category,
			images: [image],
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
			category = await this.findCategoryByName(categoryName);
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

		await this.productsRepository.remove(existingProduct);
		return { message: `Product with ID '${id}' deleted successfully` };
	}
}
