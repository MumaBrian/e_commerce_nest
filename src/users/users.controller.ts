import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Patch,
	Delete,
	UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/enums/user-role.enum';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	create(@Body() createUserDto: CreateUserDto) {
		return this.usersService.create(createUserDto);
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin)
	findAll() {
		return this.usersService.findAll();
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Customer, UserRole.Admin)
	findOne(@Param('id') id: string) {
		return this.usersService.findOne(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin)
	update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
		return this.usersService.update(id, updateUserDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(UserRole.Admin)
	remove(@Param('id') id: string) {
		return this.usersService.remove(id);
	}
}
