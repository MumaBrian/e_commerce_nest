import {
	Injectable,
	BadRequestException,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Warranty } from '../database/entities/warranty.entity';
import { CreateWarrantyDto } from './dto/create-warranty.dto';

@Injectable()
export class WarrantiesService {
	constructor(
		@InjectRepository(Warranty)
		private warrantiesRepository: Repository<Warranty>,
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

		return this.warrantiesRepository.save(warranty);
	}

	async validateWarranty(productId: string): Promise<boolean> {
		const warranty = await this.warrantiesRepository.findOne({
			where: { product: { id: productId } },
		});

		if (!warranty) {
			throw new NotFoundException('Warranty not found');
		}

		return new Date() < warranty.endDate;
	}

	async claimWarranty(productId: string): Promise<string> {
		const warranty = await this.warrantiesRepository.findOne({
			where: { product: { id: productId } },
		});

		if (!warranty) {
			throw new NotFoundException('Warranty not found');
		}

		if (new Date() < warranty.endDate) {
			return 'Warranty claim processed successfully.';
		}

		return 'Warranty claim failed. Warranty has expired or is invalid.';
	}
}
