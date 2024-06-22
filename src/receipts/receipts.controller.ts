import {
	Controller,
	Get,
	Post,
	Param,
	UseGuards,
	Body,
	Res,
	Query,
} from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/enums/user-role.enum';
import { Response } from 'express';
import * as fs from 'fs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateReceiptsDto } from './dto/create-receipts.dto'; // Import the DTO
import { SelfGuard } from 'src/common/guards/self.guard';

@ApiTags('receipts')
@Controller('receipts')
@UseGuards(JwtAuthGuard)
export class ReceiptsController {
	constructor(private readonly receiptsService: ReceiptsService) {}

	@Post('generate')
	@UseGuards(JwtAuthGuard, SelfGuard)
	@Roles(UserRole.Admin, UserRole.Customer)
	@ApiBearerAuth('authenticationToken')
	async generateReceipt(@Body() createReceiptsDto: CreateReceiptsDto) {
		return await this.receiptsService.generateReceipt(createReceiptsDto);
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin, UserRole.Customer)
	@ApiBearerAuth('authenticationToken')
	async viewReceipt(@Param('id') id: string) {
		return await this.receiptsService.viewReceipt(id);
	}

	@Get(':id/download')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin, UserRole.Customer)
	@ApiBearerAuth('authenticationToken')
	async downloadReceipt(@Param('id') id: string, @Res() res: Response) {
		const pdfPath = await this.receiptsService.downloadReceipt(id);
		if (fs.existsSync(pdfPath)) {
			res.download(pdfPath);
		} else {
			res.status(404).send('Receipt not found');
		}
	}

	@Get()
	@Roles(UserRole.Customer, UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	async getAllReceipts(
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
	) {
		return this.receiptsService.getAllReceipts(page, limit);
	}
}
