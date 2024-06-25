import {
	Injectable,
	BadRequestException,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Warranty } from '../database/entities/warranty.entity';
import { CreateWarrantyDto } from './dto/create-warranty.dto';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class WarrantiesService {
	constructor(
		@InjectRepository(Warranty)
		private warrantiesRepository: Repository<Warranty>,
		private cacheService: CacheService, // Inject CacheService
	) {}

	async create(createWarrantyDto: CreateWarrantyDto) {
		const { productId, period, startDate } = createWarrantyDto;

		if (isNaN(Date.parse(startDate.toString()))) {
			throw new BadRequestException('Invalid start date');
		}

		if (period <= 0) {
			throw new BadRequestException('Period must be greater than 0');
		}

		const start = new Date(startDate);
		const endDate = new Date(start);
		endDate.setMonth(start.getMonth() + period);

		const existingWarranty = await this.warrantiesRepository.findOne({
			where: {
				product: { id: productId },
				endDate: MoreThanOrEqual(start),
				startDate: LessThanOrEqual(endDate),
			},
		});

		if (existingWarranty) {
			throw new BadRequestException(
				'Overlapping warranty exists for this product',
			);
		}

		const warranty = this.warrantiesRepository.create({
			product: { id: productId },
			startDate: start,
			endDate: endDate,
			period,
		});

		const savedWarranty = await this.warrantiesRepository.save(warranty);
		await this.cacheService.del(`warranties:product:${productId}`);
		await this.cacheService.del('warranties:all');

		return savedWarranty;
	}

	async validateWarranty(productId: string): Promise<boolean> {
		const cacheKey = `warranty:validate:${productId}`;
		const cachedWarranty = await this.cacheService.get(cacheKey);

		if (cachedWarranty) {
			return JSON.parse(cachedWarranty);
		}

		const warranty = await this.warrantiesRepository.findOne({
			where: { product: { id: productId } },
		});

		if (!warranty) {
			throw new NotFoundException('Warranty not found');
		}

		const isValid = new Date() < warranty.endDate;
		await this.cacheService.set(cacheKey, JSON.stringify(isValid));

		return isValid;
	}

	async claimWarranty(productId: string): Promise<string> {
		const cacheKey = `warranty:claim:${productId}`;
		const cachedClaim = await this.cacheService.get(cacheKey);

		if (cachedClaim) {
			return JSON.parse(cachedClaim);
		}

		const warranty = await this.warrantiesRepository.findOne({
			where: { product: { id: productId } },
		});

		if (!warranty) {
			throw new NotFoundException('Warranty not found');
		}

		let result;
		if (new Date() < warranty.endDate) {
			result = 'Warranty claim processed successfully.';
		} else {
			result =
				'Warranty claim failed. Warranty has expired or is invalid.';
		}

		await this.cacheService.set(cacheKey, JSON.stringify(result));

		return result;
	}

	async findAll(page: number = 1, limit: number = 10): Promise<Warranty[]> {
		const cacheKey = `warranties:all:${page}:${limit}`;
		const cachedWarranties = await this.cacheService.get(cacheKey);

		if (cachedWarranties) {
			return JSON.parse(cachedWarranties);
		}

		const skip = (page - 1) * limit;
		const warranties = await this.warrantiesRepository.find({
			skip,
			take: limit,
			order: { startDate: 'DESC' },
		});

		await this.cacheService.set(cacheKey, JSON.stringify(warranties));

		return warranties;
	}
}
