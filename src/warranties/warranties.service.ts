import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warranty } from '../database/entities/warranty.entity';
import { CreateWarrantyDto } from './dto/create-warranty.dto';

@Injectable()
export class WarrantiesService {
	constructor(
		@InjectRepository(Warranty)
		private warrantiesRepository: Repository<Warranty>,
	) {}

	async create(createWarrantyDto: CreateWarrantyDto) {
		const warranty = this.warrantiesRepository.create(createWarrantyDto);
		return this.warrantiesRepository.save(warranty);
	}

	async validateWarranty(productId: string) {
		const warranty = await this.warrantiesRepository.findOne({
			where: { product: { id: productId } },
		});
		if (warranty && new Date() < warranty.endDate) {
			return true;
		}
		return false;
	}

	async claimWarranty(productId: string) {
		const warranty = await this.warrantiesRepository.findOne({
			where: { product: { id: productId } },
		});
		if (warranty && new Date() < warranty.endDate) {
			// Process warranty claim
			return 'Warranty claim processed successfully.';
		}
		return 'Warranty claim failed. Warranty has expired or is invalid.';
	}
}
