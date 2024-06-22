import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	UseGuards,
	Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/enums/user-role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
	constructor(private readonly paymentsService: PaymentsService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Customer, UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	async create(@Body() createPaymentDto: CreatePaymentDto) {
		return await this.paymentsService.create(createPaymentDto);
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Customer, UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	async findAll(
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
	) {
		return await this.paymentsService.findAll(page, limit);
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Customer, UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	async findOne(@Param('id') id: string) {
		return await this.paymentsService.findOne(id);
	}
}
