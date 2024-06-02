import {
	Injectable,
	NotFoundException,
	ConflictException,
	InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
	) {}

	async create(createUserDto: CreateUserDto): Promise<User> {
		const existingUser = await this.usersRepository.findOne({
			where: { email: createUserDto.email },
		});
		if (existingUser) {
			throw new ConflictException(
				`User with email ${createUserDto.email} already exists`,
			);
		}

		const user = this.usersRepository.create(createUserDto);
		try {
			return await this.usersRepository.save(user);
		} catch (error) {
			throw new InternalServerErrorException('Error creating user');
		}
	}

	findAll(): Promise<User[]> {
		return this.usersRepository.find();
	}

	async findOne(id: number): Promise<User> {
		const user = await this.usersRepository.findOne({ where: { id } });
		if (!user) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}
		return user;
	}

	async findByEmail(email: string): Promise<User> {
		const user = await this.usersRepository.findOne({ where: { email } });
		if (!user) {
			throw new NotFoundException(`User with email ${email} not found`);
		}
		return user;
	}

	async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
		const updateResult = await this.usersRepository.update(
			id,
			updateUserDto,
		);
		if (updateResult.affected === 0) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}

		const updatedUser = await this.usersRepository.findOne({
			where: { id },
		});
		if (!updatedUser) {
			throw new InternalServerErrorException(
				`User with ID ${id} not found after update`,
			);
		}

		return updatedUser;
	}

	async remove(id: number): Promise<void> {
		const user = await this.findOne(id);
		if (!user) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}

		const deleteResult = await this.usersRepository.delete(id);
		if (deleteResult.affected === 0) {
			throw new InternalServerErrorException(
				`Failed to delete User with ID ${id}`,
			);
		}
	}
}
