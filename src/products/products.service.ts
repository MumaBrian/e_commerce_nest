import {
	Injectable,
	NotFoundException,
	BadRequestException,
	InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager } from 'typeorm';
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
		try {
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

			return await this.productsRepository.save(product);
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new InternalServerErrorException('Error creating product');
		}
	}

	async findAll(page: number = 1, limit: number = 10): Promise<Product[]> {
		try {
			const skip = (page - 1) * limit;
			return await this.productsRepository.find({
				relations: ['category'],
				skip,
				take: limit,
			});
		} catch (error) {
			throw new InternalServerErrorException('Failed to fetch products');
		}
	}

	async findOne(id: string): Promise<Product> {
		try {
			const product = await this.productsRepository.findOne({
				where: { id },
				relations: ['category'],
			});
			if (!product) {
				throw new NotFoundException(
					`Product with ID '${id}' not found`,
				);
			}
			return product;
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new InternalServerErrorException('Failed to fetch product');
		}
	}

	async update(
		id: string,
		updateProductDto: UpdateProductDto,
	): Promise<Product> {
		const { category: categoryName, ...productData } = updateProductDto;

		let category: Category | undefined;
		if (categoryName) {
			category = await this.findCategoryByName(categoryName);
		}

		const entityManager = getManager();
		try {
			const updatedProduct = await entityManager.transaction(
				async (transactionalEntityManager) => {
					const existingProduct =
						await transactionalEntityManager.findOne(Product, {
							where: { id },
						});
					if (!existingProduct) {
						throw new NotFoundException(
							`Product with ID '${id}' not found`,
						);
					}

					await transactionalEntityManager.update(Product, id, {
						...productData,
						category,
					});

					const updatedProduct =
						await transactionalEntityManager.findOne(Product, {
							where: { id },
							relations: ['category'],
						});
					if (!updatedProduct) {
						throw new InternalServerErrorException(
							`Product with ID '${id}' not found after update`,
						);
					}

					return updatedProduct; // Ensure to return the updated product
				},
			);

			return updatedProduct; // Return the result of the transaction
		} catch (error) {
			if (
				error instanceof NotFoundException ||
				error instanceof InternalServerErrorException
			) {
				throw error;
			}
			throw new InternalServerErrorException('Error updating product');
		}
	}

	async remove(id: string): Promise<{ message: string }> {
		try {
			const existingProduct = await this.productsRepository.findOne({
				where: { id },
			});
			if (!existingProduct) {
				throw new NotFoundException(
					`Product with ID '${id}' not found`,
				);
			}

			await this.productsRepository.remove(existingProduct);
			return { message: `Product with ID '${id}' deleted successfully` };
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new InternalServerErrorException('Error deleting product');
		}
	}
}
