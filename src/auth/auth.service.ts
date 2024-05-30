import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
	) {}

	async validateUser(email: string, pass: string): Promise<any> {
		const user = await this.usersService.findByEmail(email);
		if (user && user.password === pass) {
			const { ...result } = user;
			return result;
		}
		return null;
	}

	async login(loginDto: LoginDto) {
		const user = await this.usersService.findByEmail(loginDto.email);
		const payload = { username: user.username, sub: user.id };
		return {
			access_token: this.jwtService.sign(payload),
		};
	}

	async register(registerDto: RegisterDto) {
		return this.usersService.create(registerDto);
	}
}
