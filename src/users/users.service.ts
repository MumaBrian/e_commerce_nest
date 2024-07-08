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
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class UsersService {
	private readonly logger = new Logger(UsersService.name);

	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		private cacheService: CacheService,
	) {}

	private async handleCache(key: string, fetchFunc: () => Promise<any>) {
		const cachedData = await this.cacheService.get(key);
		if (cachedData) {
			return JSON.parse(cachedData);
		}

		const data = await fetchFunc();
		await this.cacheService.set(key, JSON.stringify(data));
		return data;
	}

	private async handleError(error: any, message: string) {
		this.logger.error(message, error.message);
		throw new InternalServerErrorException(message);
	}

	async create(createUserDto: CreateUserDto): Promise<User> {
		const { role, email, password } = createUserDto;
		const existingUser = await this.usersRepository.findOne({
			where: { email },
		});

		if (existingUser) {
			throw new ConflictException(
				`User with email ${email} already exists`,
			);
		}

		let hashedPassword = null;
		if (password) {
			hashedPassword = await bcrypt.hash(password, 10);
		}

		const otpCreatedAt = new Date();

		const user = this.usersRepository.create({
			...createUserDto,
			password: hashedPassword,
			roles: role,
			otpCreatedAt,
		});

		const savedUser = await this.usersRepository.save(user);
		await this.cacheService.del('users:all');

		return savedUser;
	}

	async findAll(page: number = 1, limit: number = 10): Promise<User[]> {
		const cacheKey = `users:all:${page}:${limit}`;
		return this.handleCache(cacheKey, async () => {
			const skip = (page - 1) * limit;
			return this.usersRepository.find({ skip, take: limit });
		});
	}

	async findOne(id: string): Promise<User> {
		const cacheKey = `user:${id}`;
		return this.handleCache(cacheKey, async () => {
			const user = await this.usersRepository.findOne({ where: { id } });
			if (!user) {
				this.logger.warn(`User with ID ${id} not found`);
				throw new NotFoundException(`User with ID ${id} not found`);
			}
			return user;
		});
	}

	async findByEmail(email: string): Promise<User> {
		const cacheKey = `user:email:${email}`;
		return this.handleCache(cacheKey, async () => {
			const user = await this.usersRepository.findOne({
				where: { email },
			});
			if (!user) {
				this.logger.warn(`User with email ${email} not found`);
				throw new NotFoundException(
					`User with email ${email} not found`,
				);
			}
			return user;
		});
	}

	async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
		const updateResult = await this.usersRepository.update(
			id,
			updateUserDto,
		);
		if (updateResult.affected === 0) {
			this.logger.warn(`User with ID ${id} not found`);
			throw new NotFoundException(`User with ID ${id} not found`);
		}

		const updatedUser = await this.findOne(id);
		await this.cacheService.del(`user:${id}`);
		await this.cacheService.del('users:all');

		return updatedUser;
	}

	async remove(id: string): Promise<void> {
		const user = await this.findOne(id);

		const deleteResult = await this.usersRepository.delete(user);
		if (deleteResult.affected === 0) {
			this.logger.error(`Failed to delete User with ID ${id}`);
			throw new InternalServerErrorException(
				`Failed to delete User with ID ${id}`,
			);
		}

		await this.cacheService.del(`user:${id}`);
		await this.cacheService.del('users:all');
	}

	async updateProfile(
		id: string,
		updateUserDto: UpdateUserDto,
	): Promise<User> {
		await this.update(id, updateUserDto);
		return this.findOne(id);
	}

	async updatePassword(
		id: string,
		updatePasswordDto: UpdatePasswordDto,
	): Promise<void> {
		const { currentPassword, newPassword } = updatePasswordDto;
		const user = await this.findOne(id);

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
		await this.cacheService.del(`user:${id}`);
		await this.cacheService.del('users:all');
	}

	async findAdmin(): Promise<User | null> {
		const cacheKey = 'user:admin';
		return this.handleCache(cacheKey, async () => {
			const admin = await this.usersRepository.findOne({
				where: { roles: UserRole.Admin },
			});
			return admin || null;
		});
	}

	async updateRefreshToken(
		userId: string,
		refreshToken: string | null,
	): Promise<void> {
		await this.usersRepository.update(userId, { refreshToken });
	}

	async findById(id: string): Promise<User> {
		const user = await this.usersRepository.findOne({ where: { id: id } });
		if (!user) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}
		return user;
	}

	async updateResetToken(
		userId: string,
		resetToken: string,
		resetTokenExpiry: Date,
	): Promise<void> {
		await this.usersRepository.update(userId, {
			resetToken,
			resetTokenExpiry,
		});
	}

	async findByResetToken(token: string): Promise<User> {
		const user = await this.usersRepository.findOne({
			where: { resetToken: token },
		});
		if (!user) {
			throw new NotFoundException('Invalid reset token');
		}
		return user;
	}
}
