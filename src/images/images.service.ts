import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '../database/entities/image.entity';
import { Product } from '../database/entities/product.entity';
import { CreateImageDto } from './dto/create-image.dto';

@Injectable()
export class ImagesService {
	constructor(
		@InjectRepository(Image)
		private imagesRepository: Repository<Image>,
		@InjectRepository(Product)
		private productsRepository: Repository<Product>,
	) {}

	async create(createImageDto: CreateImageDto) {
		const { url } = createImageDto;

		if (!url) {
			throw new BadRequestException('URL and productId must be provided');
		}

		const image = this.imagesRepository.create({ url });

		try {
			return await this.imagesRepository.save(image);
		} catch (error) {
			throw new Error(`Failed to save image: ${error.message}`);
		}
	}

	async findAll() {
		try {
			return await this.imagesRepository.find({ relations: ['product'] });
		} catch (error) {
			throw new Error(`Failed to fetch images: ${error.message}`);
		}
	}

	async findOne(id: string) {
		if (!id) {
			throw new BadRequestException('ID must be provided');
		}

		const image = await this.imagesRepository.findOne({
			where: { id },
			relations: ['product'],
		});

		if (!image) {
			throw new NotFoundException(`Image with id ${id} not found`);
		}

		return image;
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
			return { message: `Image with id ${id} successfully deleted` };
		} catch (error) {
			throw new Error(`Failed to delete image: ${error.message}`);
		}
	}
}
