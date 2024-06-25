import {
	Injectable,
	NotFoundException,
	ConflictException,
	InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../database/entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class CategoriesService {
	constructor(
		@InjectRepository(Category)
		private categoriesRepository: Repository<Category>,
		private cacheService: CacheService,
	) {}

	async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
		try {
			const existingCategory = await this.categoriesRepository.findOne({
				where: { name: createCategoryDto.name },
			});
			if (existingCategory) {
				throw new ConflictException(
					`Category with name ${createCategoryDto.name} already exists`,
				);
			}

			const category =
				this.categoriesRepository.create(createCategoryDto);
			const savedCategory =
				await this.categoriesRepository.save(category);
			await this.cacheService.del('categories:all');
			return savedCategory;
		} catch (error) {
			throw new InternalServerErrorException(
				'Error creating category',
				error.message,
			);
		}
	}

	async findAll(
		page: number,
		limit: number,
	): Promise<{
		data: Category[];
		total: number;
		page: number;
		limit: number;
	}> {
		try {
			const cacheKey = `categories:all:${page}:${limit}`;
			const cachedCategories = await this.cacheService.get(cacheKey);

			if (cachedCategories) {
				return JSON.parse(cachedCategories);
			}

			const [data, total] = await this.categoriesRepository.findAndCount({
				skip: (page - 1) * limit,
				take: limit,
			});

			const result = {
				data,
				total,
				page,
				limit,
			};

			await this.cacheService.set(cacheKey, JSON.stringify(result));
			return result;
		} catch (error) {
			throw new InternalServerErrorException(
				'Error finding categories:',
				error.message,
			);
		}
	}

	async findOne(id: string): Promise<Category> {
		try {
			const cacheKey = `category:${id}`;
			const cachedCategory = await this.cacheService.get(cacheKey);

			if (cachedCategory) {
				return JSON.parse(cachedCategory);
			}

			const category = await this.categoriesRepository.findOne({
				where: { id },
			});
			if (!category) {
				throw new NotFoundException(`Category with ID ${id} not found`);
			}

			await this.cacheService.set(cacheKey, JSON.stringify(category));
			return category;
		} catch (error) {
			console.error(
				`Error finding category with ID ${id}:`,
				error.message,
			);
			throw new InternalServerErrorException('Error finding category');
		}
	}

	async update(
		id: string,
		updateCategoryDto: UpdateCategoryDto,
	): Promise<Category> {
		try {
			const category = await this.categoriesRepository.findOne({
				where: { id },
			});
			if (!category) {
				throw new NotFoundException(`Category with ID ${id} not found`);
			}

			await this.categoriesRepository.update(id, updateCategoryDto);
			const updatedCategory = await this.categoriesRepository.findOne({
				where: { id },
			});

			await this.cacheService.del(`category:${id}`);
			await this.cacheService.del('categories:all');
			return updatedCategory;
		} catch (error) {
			console.error(
				`Error updating category with ID ${id}:`,
				error.message,
			);
			throw new InternalServerErrorException('Error updating category');
		}
	}

	async remove(id: string): Promise<void> {
		try {
			const category = await this.categoriesRepository.findOne({
				where: { id },
			});
			if (!category) {
				throw new NotFoundException(`Category with ID ${id} not found`);
			}

			const deleteResult = await this.categoriesRepository.delete(id);
			if (deleteResult.affected === 0) {
				throw new InternalServerErrorException(
					`Failed to delete category with ID ${id}`,
				);
			}

			await this.cacheService.del(`category:${id}`);
			await this.cacheService.del('categories:all');
		} catch (error) {
			console.error(
				`Error deleting category with ID ${id}:`,
				error.message,
			);
			throw new InternalServerErrorException('Error deleting category');
		}
	}
}
