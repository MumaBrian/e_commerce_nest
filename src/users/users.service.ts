import { Injectable } from '@nestjs/common';
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

	create(createUserDto: CreateUserDto) {
		const user = this.usersRepository.create(createUserDto);
		return this.usersRepository.save(user);
	}

	findAll() {
		return this.usersRepository.find();
	}

	findOne(id: number) {
		return this.usersRepository.findOne({ where: { id } });
	}

	findByEmail(email: string) {
		return this.usersRepository.findOne({ where: { email } });
	}

	async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
		const updateResult = await this.usersRepository.update(id, updateUserDto);
		console.log("update:",updateResult)
		
		if (updateResult.affected === 0) {
			throw new Error(`User with id ${id} not found`);
		}
		
		const updatedUser = await this.usersRepository.findOne({ where: { id } });
		
		if (!updatedUser) {
			throw new Error(`User with id ${id} not found after update`);
		}
		
		return updatedUser;
	}
	

	remove(id: number) {
		return this.usersRepository.delete(id);
	}
}
