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

@Injectable()
export class CategoriesService {
	constructor(
		@InjectRepository(Category)
		private categoriesRepository: Repository<Category>,
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
			return await this.categoriesRepository.save(category);
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
			const [data, total] = await this.categoriesRepository.findAndCount({
				skip: (page - 1) * limit,
				take: limit,
			});
			return {
				data,
				total,
				page,
				limit,
			};
		} catch (error) {
			throw new InternalServerErrorException(
				'Error finding categories:',
				error.message,
			);
		}
	}

	async findOne(id: string): Promise<Category> {
		try {
			const category = await this.categoriesRepository.findOne({
				where: { id },
			});
			if (!category) {
				throw new NotFoundException(`Category with ID ${id} not found`);
			}
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
			return this.categoriesRepository.findOne({ where: { id } });
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
		} catch (error) {
			console.error(
				`Error deleting category with ID ${id}:`,
				error.message,
			);
			throw new InternalServerErrorException('Error deleting category');
		}
	}
}
