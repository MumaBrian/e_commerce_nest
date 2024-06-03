import {
	Controller,
	Post,
	Body,
	Param,
	Patch,
	Delete,
	UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/enums/user-role.enum';

@Controller('admin')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.Admin)
export class AdminController {
	constructor(private readonly adminService: AdminService) {}

	@Post('products')
	async manageProducts(@Body() productDetails: any) {
		return await this.adminService.manageProducts(productDetails);
	}

	@Patch('products/:id')
	async updateProduct(@Param('id') id: string, @Body() productDetails: any) {
		return await this.adminService.updateProduct(id, productDetails);
	}

	@Delete('products/:id')
	async deleteProduct(@Param('id') id: string) {
		return await this.adminService.deleteProduct(id);
	}

	@Post('categories')
	async manageCategories(@Body() categoryDetails: any) {
		return await this.adminService.manageCategories(categoryDetails);
	}

	@Patch('categories/:id')
	async updateCategory(
		@Param('id') id: string,
		@Body() categoryDetails: any,
	) {
		return await this.adminService.updateCategory(id, categoryDetails);
	}

	@Delete('categories/:id')
	async deleteCategory(@Param('id') id: string) {
		return await this.adminService.deleteCategory(id);
	}

	@Post('warranties')
	async defineWarranty(@Body() warrantyDetails: any) {
		return await this.adminService.defineWarranty(warrantyDetails);
	}

	@Post('users')
	async manageUser(@Body() userDetails: any) {
		return await this.adminService.manageUser(userDetails);
	}
}
