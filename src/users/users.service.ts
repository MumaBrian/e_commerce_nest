import {
	Injectable,
	NotFoundException,
	ConflictException,
	InternalServerErrorException,
	BadRequestException,
	Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/database/enums/user-role.enum';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService {
	private readonly logger = new Logger(UsersService.name);

	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
	) {}

	async create(createUserDto: CreateUserDto): Promise<User> {
		try {
			const existingUser = await this.usersRepository.findOne({
				where: { email: createUserDto.email },
			});
			if (existingUser) {
				throw new ConflictException(
					`User with email ${createUserDto.email} already exists`,
				);
			}

			const hashedPassword = await bcrypt.hash(
				createUserDto.password,
				10,
			);
			const user = this.usersRepository.create({
				...createUserDto,
				password: hashedPassword,
			});

			return await this.usersRepository.save(user);
		} catch (error) {
			this.logger.error('Error creating user:', error.message);
			if (error instanceof ConflictException) {
				throw error;
			}
			throw new InternalServerErrorException('Error creating user');
		}
	}

	async findAll(page: number = 1, limit: number = 10): Promise<User[]> {
		const skip = (page - 1) * limit;

		return await this.usersRepository.find({
			skip,
			take: limit,
		});
	}

	async findOne(id: string): Promise<User> {
		const user = await this.usersRepository.findOne({ where: { id } });
		if (!user) {
			this.logger.warn(`User with ID ${id} not found`);
			throw new NotFoundException(`User with ID ${id} not found`);
		}
		return user;
	}

	async findByEmail(email: string): Promise<User> {
		const user = await this.usersRepository.findOne({ where: { email } });
		if (!user) {
			this.logger.warn(`User with email ${email} not found`);
			throw new NotFoundException(`User with email ${email} not found`);
		}
		return user;
	}

	async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
		try {
			const updateResult = await this.usersRepository.update(
				id,
				updateUserDto,
			);
			if (updateResult.affected === 0) {
				this.logger.warn(`User with ID ${id} not found`);
				throw new NotFoundException(`User with ID ${id} not found`);
			}

			const updatedUser = await this.usersRepository.findOne({
				where: { id },
			});
			if (!updatedUser) {
				this.logger.error(`User with ID ${id} not found after update`);
				throw new InternalServerErrorException(
					`User with ID ${id} not found after update`,
				);
			}

			return updatedUser;
		} catch (error) {
			this.logger.error('Error updating user:', error.message);
			throw new InternalServerErrorException('Error updating user');
		}
	}

	async remove(id: string): Promise<void> {
		try {
			const user = await this.usersRepository.findOne({ where: { id } });
			if (!user) {
				this.logger.warn(`User with ID ${id} not found`);
				throw new NotFoundException(`User with ID ${id} not found`);
			}

			const deleteResult = await this.usersRepository.delete(id);
			if (deleteResult.affected === 0) {
				this.logger.error(`Failed to delete User with ID ${id}`);
				throw new InternalServerErrorException(
					`Failed to delete User with ID ${id}`,
				);
			}
		} catch (error) {
			this.logger.error('Error deleting user:', error.message);
			throw new InternalServerErrorException('Error deleting user');
		}
	}

	async updateProfile(
		id: string,
		updateUserDto: UpdateUserDto,
	): Promise<User> {
		try {
			const user = await this.usersRepository.findOne({ where: { id } });
			if (!user) {
				this.logger.warn('User not found');
				throw new NotFoundException('User not found');
			}

			await this.usersRepository.update(id, updateUserDto);
			const updatedUser = await this.usersRepository.findOne({
				where: { id },
			});
			return updatedUser;
		} catch (error) {
			this.logger.error('Error updating profile:', error.message);
			throw new InternalServerErrorException('Error updating profile');
		}
	}

	async updatePassword(
		id: string,
		updatePasswordDto: UpdatePasswordDto,
	): Promise<void> {
		const { currentPassword, newPassword } = updatePasswordDto;
		try {
			const user = await this.usersRepository.findOne({ where: { id } });

			if (!user) {
				this.logger.warn('User not found');
				throw new NotFoundException('User not found');
			}

			const isPasswordValid = await bcrypt.compare(
				currentPassword,
				user.password,
			);
			if (!isPasswordValid) {
				this.logger.warn('Current password is incorrect');
				throw new BadRequestException('Current password is incorrect');
			}

			const hashedPassword = await bcrypt.hash(newPassword, 10);
			user.password = hashedPassword;

			await this.usersRepository.save(user);
		} catch (error) {
			this.logger.error('Error updating password:', error.message);
			throw new InternalServerErrorException('Error updating password');
		}
	}

	async findAdmin(): Promise<User | null> {
		try {
			return await this.usersRepository.findOne({
				where: { roles: UserRole.Admin },
			});
		} catch (error) {
			this.logger.error('Error finding admin:', error.message);
			throw new InternalServerErrorException('Error finding admin');
		}
	}
}
