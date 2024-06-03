import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../database/entities/product.entity';
import { Category } from '../database/entities/category.entity';
import { User } from '../database/entities/user.entity';
import { Warranty } from '../database/entities/warranty.entity';

@Injectable()
export class AdminService {
	constructor(
		@InjectRepository(Product)
		private productsRepository: Repository<Product>,
		@InjectRepository(Category)
		private categoriesRepository: Repository<Category>,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		@InjectRepository(Warranty)
		private warrantiesRepository: Repository<Warranty>,
	) {}

	async manageProducts(productDetails: any) {
		try {
			const product = this.productsRepository.create(productDetails);
			return await this.productsRepository.save(product);
		} catch (error) {
			throw new BadRequestException('Failed to create product');
		}
	}

	async updateProduct(id: string, productDetails: any) {
		try {
			const existingProduct = await this.productsRepository.findOne({
				where: {
					id,
				},
			});
			if (!existingProduct) {
				throw new NotFoundException(`Product with id ${id} not found`);
			}
			await this.productsRepository.update(id, productDetails);
			return await this.productsRepository.findOne({
				where: {
					id,
				},
			});
		} catch (error) {
			throw new BadRequestException('Failed to update product');
		}
	}

	async deleteProduct(id: string) {
		try {
			const existingProduct = await this.productsRepository.findOne({
				where: {
					id,
				},
			});
			if (!existingProduct) {
				throw new NotFoundException(`Product with id ${id} not found`);
			}
			await this.productsRepository.delete(id);
			return { message: 'Product deleted successfully' };
		} catch (error) {
			throw new BadRequestException('Failed to delete product');
		}
	}

	async manageCategories(categoryDetails: any) {
		try {
			const category = this.categoriesRepository.create(categoryDetails);
			return await this.categoriesRepository.save(category);
		} catch (error) {
			throw new BadRequestException('Failed to create category');
		}
	}

	async updateCategory(id: string, categoryDetails: any) {
		try {
			const existingCategory = await this.categoriesRepository.findOne({
				where: {
					id,
				},
			});
			if (!existingCategory) {
				throw new NotFoundException(`Category with id ${id} not found`);
			}
			await this.categoriesRepository.update(id, categoryDetails);
			return await this.categoriesRepository.findOne({
				where: {
					id,
				},
			});
		} catch (error) {
			throw new BadRequestException('Failed to update category');
		}
	}

	async deleteCategory(id: string) {
		try {
			const existingCategory = await this.categoriesRepository.findOne({
				where: {
					id,
				},
			});
			if (!existingCategory) {
				throw new NotFoundException(`Category with id ${id} not found`);
			}
			await this.categoriesRepository.delete(id);
			return { message: 'Category deleted successfully' };
		} catch (error) {
			throw new BadRequestException('Failed to delete category');
		}
	}

	async defineWarranty(warrantyDetails: any) {
		try {
			const warranty = this.warrantiesRepository.create(warrantyDetails);
			return await this.warrantiesRepository.save(warranty);
		} catch (error) {
			throw new BadRequestException('Failed to create warranty');
		}
	}

	async manageUser(userDetails: any) {
		try {
			const user = this.usersRepository.create(userDetails);
			return await this.usersRepository.save(user);
		} catch (error) {
			throw new BadRequestException('Failed to create user');
		}
	}
}
