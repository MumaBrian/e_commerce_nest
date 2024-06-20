import {
	Controller,
	Get,
	Post,
	Param,
	UseGuards,
	Body,
	Res,
} from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/enums/user-role.enum';
import { Response } from 'express';
import * as fs from 'fs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateReceiptsDto } from './dto/create-receipts.dto'; // Import the DTO

@ApiTags('receipts')
@Controller('receipts')
@UseGuards(JwtAuthGuard)
export class ReceiptsController {
	constructor(private readonly receiptsService: ReceiptsService) {}

	@Post('generate')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin, UserRole.Customer)
	@ApiBearerAuth('authenticationToken')
	generateReceipt(@Body() createReceiptsDto: CreateReceiptsDto) {
		return this.receiptsService.generateReceipt(createReceiptsDto);
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin, UserRole.Customer)
	@ApiBearerAuth('authenticationToken')
	viewReceipt(@Param('id') id: string) {
		return this.receiptsService.viewReceipt(id);
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
}
