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
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class ProductsService {
	constructor(
		@InjectRepository(Product)
		private productsRepository: Repository<Product>,
		@InjectRepository(Category)
		private categoriesRepository: Repository<Category>,
		@InjectRepository(Image)
		private imageRepository: Repository<Image>,
		private cacheService: CacheService,
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

			image.product = product;

			await this.productsRepository.save(product);
			await this.cacheService.del('products:all');

			return product;
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error;
			}
			throw new InternalServerErrorException('Error creating product');
		}
	}

	async findAll(page: number = 1, limit: number = 10): Promise<Product[]> {
		try {
			const cacheKey = `products:all:${page}:${limit}`;
			const cachedProducts = await this.cacheService.get(cacheKey);

			if (cachedProducts) {
				return JSON.parse(cachedProducts);
			}

			const skip = (page - 1) * limit;
			const products = await this.productsRepository.find({
				relations: ['category', 'images'],
				skip,
				take: limit,
			});

			await this.cacheService.set(cacheKey, JSON.stringify(products));
			return products;
		} catch (error) {
			throw new InternalServerErrorException('Failed to fetch products');
		}
	}

	async findOne(id: string): Promise<Product> {
		try {
			const cacheKey = `product:${id}`;
			const cachedProduct = await this.cacheService.get(cacheKey);

			if (cachedProduct) {
				return JSON.parse(cachedProduct);
			}

			const product = await this.productsRepository.findOne({
				where: { id },
				relations: ['category', 'images'],
			});
			if (!product) {
				throw new NotFoundException(
					`Product with ID '${id}' not found`,
				);
			}

			await this.cacheService.set(cacheKey, JSON.stringify(product));
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
							relations: ['category', 'images'],
						});
					if (!updatedProduct) {
						throw new InternalServerErrorException(
							`Product with ID '${id}' not found after update`,
						);
					}

					return updatedProduct;
				},
			);

			await this.cacheService.del(`product:${id}`);
			await this.cacheService.del('products:all');

			return updatedProduct;
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
			await this.cacheService.del(`product:${id}`);
			await this.cacheService.del('products:all');

			return { message: `Product with ID '${id}' deleted successfully` };
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new InternalServerErrorException('Error deleting product');
		}
	}
}
