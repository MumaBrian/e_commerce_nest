import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/database/enums/user-role.enum';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
	) {}

	async validateUser(email: string, pass: string): Promise<any> {
		const user = await this.usersService.findByEmail(email);
		if (!user) {
			throw new HttpException(
				'Invalid credentials',
				HttpStatus.UNAUTHORIZED,
			);
		}

		const isPasswordValid = await bcrypt.compare(pass, user.password);

		if (!isPasswordValid) {
			throw new HttpException(
				'Invalid credentials',
				HttpStatus.UNAUTHORIZED,
			);
		}

		const { password, ...result } = user;
		return result;
	}

	async login(loginDto: LoginDto) {
		try {
			const user = await this.validateUser(
				loginDto.email,
				loginDto.password,
			);
			const payload = {
				username: user.username,
				sub: user.id,
				roles: user.roles,
			};
			return {
				access_token: this.jwtService.sign(payload),
			};
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
		}
	}

	async register(registerDto: RegisterDto) {
		try {
			let existingUser;
			try {
				existingUser = await this.usersService.findByEmail(
					registerDto.email,
				);
			} catch (error) {
				if (
					error instanceof HttpException &&
					error.getStatus() === HttpStatus.NOT_FOUND
				) {
					existingUser = null;
				} else {
					throw error;
				}
			}

			if (existingUser) {
				throw new HttpException(
					'User already exists',
					HttpStatus.CONFLICT,
				);
			}

			if (registerDto.role === UserRole.Admin) {
				const existingAdmin = await this.usersService.findAdmin();
				if (existingAdmin) {
					throw new HttpException(
						{
							status: HttpStatus.FORBIDDEN,
							error: 'Change user role to Customer',
							message: 'Change user role to Customer',
						},
						HttpStatus.FORBIDDEN,
					);
				}
			}

			return await this.usersService.create(registerDto);
		} catch (error) {
			console.error('Registration error:', error.message);
			throw new HttpException(
				'Registration failed',
				HttpStatus.BAD_REQUEST,
			);
		}
	}
}
