import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { WarrantiesService } from './warranties.service';
import { CreateWarrantyDto } from './dto/create-warranty.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/enums/user-role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SelfGuard } from 'src/common/guards/self.guard';

@ApiTags('warranties')
@Controller('warranties')
export class WarrantiesController {
	constructor(private readonly warrantiesService: WarrantiesService) {}

	@Post()
	@UseGuards(JwtAuthGuard, SelfGuard)
	@Roles(UserRole.Customer, UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	async create(@Body() createWarrantyDto: CreateWarrantyDto) {
		return await this.warrantiesService.create(createWarrantyDto);
	}

	@Post('validate/:productId')
	@UseGuards(JwtAuthGuard, SelfGuard)
	@Roles(UserRole.Customer, UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	async validateWarranty(@Param('productId') productId: string) {
		return await this.warrantiesService.validateWarranty(productId);
	}

	@Post('claim/:productId')
	@UseGuards(JwtAuthGuard, SelfGuard)
	@Roles(UserRole.Customer, UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	async claimWarranty(@Param('productId') productId: string) {
		return await this.warrantiesService.claimWarranty(productId);
	}
}
