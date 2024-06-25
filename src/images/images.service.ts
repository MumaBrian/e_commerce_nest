import {
	Injectable,
	NotFoundException,
	BadRequestException,
	InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '../database/entities/image.entity';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { CacheService } from 'src/cache/cache.service';
import { Product } from 'src/database/entities/product.entity';

@Injectable()
export class ImagesService {
	constructor(
		@InjectRepository(Image)
		private imagesRepository: Repository<Image>,
		@InjectRepository(Product)
		private productsRepository: Repository<Product>,
		private cacheService: CacheService,
	) {}

	async create(createImageDto: CreateImageDto) {
		const { url } = createImageDto;

		if (!url) {
			throw new BadRequestException('URL must be provided');
		}

		const image = this.imagesRepository.create({ url });

		try {
			return await this.imagesRepository.save(image);
		} catch (error) {
			throw new Error(`Failed to save image: ${error.message}`);
		}
	}

	async findAll(page: number, limit: number) {
		try {
			const cacheKey = `images:all:${page}:${limit}`;
			const cachedImages = await this.cacheService.get(cacheKey);

			if (cachedImages) {
				return JSON.parse(cachedImages);
			}

			const [images, total] = await this.imagesRepository.findAndCount({
				relations: ['product'],
				skip: (page - 1) * limit,
				take: limit,
			});

			await this.cacheService.set(
				cacheKey,
				JSON.stringify({ data: images, total, page, limit }),
			);

			return { data: images, total, page, limit };
		} catch (error) {
			throw new Error(`Failed to fetch images: ${error.message}`);
		}
	}

	async findOne(id: string) {
		if (!id) {
			throw new BadRequestException('ID must be provided');
		}

		const cacheKey = `image:${id}`;
		const cachedImage = await this.cacheService.get(cacheKey);

		if (cachedImage) {
			return JSON.parse(cachedImage);
		}

		const image = await this.imagesRepository.findOne({
			where: { id },
			relations: ['product'],
		});

		if (!image) {
			throw new NotFoundException(`Image with id ${id} not found`);
		}

		await this.cacheService.set(cacheKey, JSON.stringify(image)); // Cache indefinitely or set TTL as required

		return image;
	}

	async update(id: string, updateImageDto: UpdateImageDto): Promise<Image> {
		if (!id) {
			throw new BadRequestException('ID must be provided');
		}

		const image = await this.imagesRepository.findOne({
			where: { id },
		});
		if (!image) {
			throw new NotFoundException(`Image with id ${id} not found`);
		}

		Object.assign(image, updateImageDto);

		try {
			return await this.imagesRepository.save(image);
		} catch (error) {
			throw new InternalServerErrorException(
				`Failed to update image: ${error.message}`,
			);
		}
	}

	async remove(id: string) {
		if (!id) {
			throw new BadRequestException('ID must be provided');
		}

		const image = await this.imagesRepository.findOne({
			where: { id },
		});

		if (!image) {
			throw new NotFoundException(`Image with id ${id} not found`);
		}

		try {
			await this.imagesRepository.delete(id);
			await this.cacheService.del(`image:${id}`);
			await this.cacheService.del('images:all');

			return { message: `Image with id ${id} successfully deleted` };
		} catch (error) {
			throw new Error(`Failed to delete image: ${error.message}`);
		}
	}

	async uploadImage(file: Express.Multer.File, productId: string) {
		if (!file || !productId) {
			throw new BadRequestException(
				'File and productId must be provided',
			);
		}

		const product = await this.productsRepository.findOne({
			where: { id: productId },
		});
		if (!product) {
			throw new NotFoundException(
				`Product with id ${productId} not found`,
			);
		}

		const uploadPath = path.join(
			__dirname,
			'../../../e_commerce/src/images/uploads/',
			file.originalname,
		);

		if (!file.buffer) {
			throw new BadRequestException('File buffer is empty');
		}

		fs.writeFileSync(uploadPath, file.buffer);

		const imageUrl = `/uploads/${file.originalname}`;
		const image = this.imagesRepository.create({
			url: imageUrl,
		});

		try {
			return await this.imagesRepository.save(image);
		} catch (error) {
			throw new InternalServerErrorException(
				`Failed to save image: ${error.message}`,
			);
		}
	}
}
