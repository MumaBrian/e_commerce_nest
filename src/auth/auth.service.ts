import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
	) {}

	async validateUser(email: string, pass: string): Promise<any> {
		const user = await this.usersService.findByEmail(email);
		if (user && (await bcrypt.compare(pass, user.password))) {
			const { password, ...result } = user;
			return result;
		}
		return null;
	}

	async login(loginDto: LoginDto) {
		try {
			const user = await this.usersService.findByEmail(loginDto.email);
			if (!user) {
				throw new Error('User not found');
			}
			const payload = { username: user.username, sub: user.id };
			return {
				access_token: this.jwtService.sign(payload),
			};
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
		}
	}

	async register(registerDto: RegisterDto) {
		try {
			const existingUser = await this.usersService.findByEmail(
				registerDto.email,
			);
			if (existingUser) {
				throw new HttpException(
					'User already exists',
					HttpStatus.CONFLICT,
				);
			}

			return await this.usersService.create(registerDto);
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
		}
	}
}
