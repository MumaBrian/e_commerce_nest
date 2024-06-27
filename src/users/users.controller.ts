import {
	Controller,
	Get,
	Body,
	Param,
	Patch,
	Delete,
	UseGuards,
	Put,
	Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/enums/user-role.enum';
import { SelfGuard } from '../common/guards/self.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdatePasswordDto } from './dto/update-password.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	async findAll(
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
	) {
		return await this.usersService.findAll(page, limit);
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	async findOne(@Param('id') id: string) {
		return await this.usersService.findOne(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, SelfGuard)
	@Roles(UserRole.Customer, UserRole.Admin)
	@ApiBearerAuth('authenticationToken')
	async update(
		@Param('id') id: string,
		@Body() updateUserDto: UpdateUserDto,
	) {
		return await this.usersService.update(id, updateUserDto);
	}

	@Delete(':id')
	// @UseGuards(JwtAuthGuard, SelfGuard)
	// @Roles(UserRole.Admin)
	// @ApiBearerAuth('authenticationToken')
	async remove(@Param('id') id: string) {
		return await this.usersService.remove(id);
	}

	@UseGuards(JwtAuthGuard, SelfGuard)
	@Roles(UserRole.Admin, UserRole.Customer)
	@Put(':id/profile')
	@ApiBearerAuth('authenticationToken')
	async updateProfile(
		@Param('id') id: string,
		@Body() updateUserDto: UpdateUserDto,
	) {
		return await this.usersService.updateProfile(id, updateUserDto);
	}

	@UseGuards(JwtAuthGuard, SelfGuard)
	@Roles(UserRole.Admin)
	@Put(':id/password')
	@ApiBearerAuth('authenticationToken')
	async updatePassword(
		@Param('id') id: string,
		@Body() updatePasswordDto: UpdatePasswordDto,
	) {
		return await this.usersService.updatePassword(id, updatePasswordDto);
	}
}
