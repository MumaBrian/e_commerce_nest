import {
	BadRequestException,
	HttpException,
	HttpStatus,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/database/enums/user-role.enum';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { MailService } from '../mail/mail.service';
import { User } from 'src/database/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { randomBytes } from 'crypto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import Redis from 'ioredis';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);
	private redisClient: Redis;
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		private usersService: UsersService,
		private jwtService: JwtService,
		private mailService: MailService,
		private cacheService: CacheService,
	) {}

	private async findUserByEmail(email: string): Promise<User> {
		const user = await this.usersService.findByEmail(email);
		if (!user) {
			throw new HttpException(
				'Invalid credentials',
				HttpStatus.UNAUTHORIZED,
			);
		}
		return user;
	}

	private async verifyPassword(
		pass: string,
		hashedPassword: string,
	): Promise<void> {
		const isPasswordValid = await bcrypt.compare(pass, hashedPassword);

		if (!isPasswordValid) {
			throw new HttpException(
				'Invalid credentials',
				HttpStatus.UNAUTHORIZED,
			);
		}
	}

	private async checkUserVerification(user: User): Promise<void> {
		if (!user.isVerified) {
			throw new HttpException(
				'Please verify your email before logging in',
				HttpStatus.UNAUTHORIZED,
			);
		}
	}

	async validateUser(email: string, pass: string): Promise<any> {
		const user = await this.findUserByEmail(email);
		await this.verifyPassword(pass, user.password);
		await this.checkUserVerification(user);
		const { password, ...result } = user;
		return result;
	}

	async validateOAuthLogin(user: any): Promise<any> {
		const newUser = await this.checkExistingUser(user.email);
		if (!newUser) {
			const User = {
				username: user.email.split('@')[0],
				email: user.email,
				password: null,
				isVerified: true,
				role: UserRole.Customer,
				otp: null,
			};

			const createdUser = await this.usersService.create(User);
			return createdUser;
		}
		return newUser;
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
			return { access_token: this.jwtService.sign(payload) };
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
		}
	}

	async refreshToken(tokenDto: RefreshTokenDto) {
		try {
			const token = tokenDto.token;
			const payload = this.jwtService.verify(token);
			const user = await this.usersService.findById(payload.sub);
			if (!user || user.refreshToken !== token) {
				throw new HttpException(
					'Invalid refresh token',
					HttpStatus.UNAUTHORIZED,
				);
			}

			const newAccessToken = this.jwtService.sign({
				username: user.username,
				sub: user.id,
				roles: user.roles,
			});

			return { access_token: newAccessToken };
		} catch (error) {
			throw new HttpException(
				'Invalid refresh token',
				HttpStatus.UNAUTHORIZED,
			);
		}
	}

	async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
		const { email } = forgotPasswordDto;
		const user = await this.usersService.findByEmail(email);
		if (!user) {
			throw new NotFoundException('User not found');
		}

		const resetToken = randomBytes(32).toString('hex');
		const resetTokenExpiry = new Date();
		resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);

		await this.usersService.updateResetToken(
			user.id,
			resetToken,
			resetTokenExpiry,
		);
		await this.mailService.sendPasswordReset(email, resetToken);
	}

	async resetPassword(resetPasswordDto: ResetPasswordDto) {
		const { token, newPassword } = resetPasswordDto;
		const user = await this.usersService.findByResetToken(token);
		if (!user || user.resetTokenExpiry < new Date()) {
			throw new HttpException(
				'Invalid or expired reset token',
				HttpStatus.UNAUTHORIZED,
			);
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);
		user.password = hashedPassword;
		user.resetToken = null;
		user.resetTokenExpiry = null;

		await this.usersRepository.save(user);
		await this.cacheService.del(`user:email:${user.email}`);
	}

	private async checkExistingUser(email: string): Promise<any> {
		const existingUser = await this.usersService
			.findByEmail(email)
			.catch(() => null);
		if (existingUser) {
			throw new HttpException(
				'Email is already in use',
				HttpStatus.CONFLICT,
			);
		}
	}

	private async checkAdminRole(role: UserRole): Promise<void> {
		if (role === UserRole.Admin) {
			const existingAdmin = await this.usersService.findAdmin();
			if (existingAdmin) {
				throw new HttpException(
					'Change user role to Customer',
					HttpStatus.FORBIDDEN,
				);
			}
		}
	}

	private generateOtp(): string {
		return Math.floor(100000 + Math.random() * 900000).toString();
	}

	private async sendOtp(email: string, otp: string): Promise<void> {
		try {
			await this.mailService.sendOtp(email, otp);
		} catch (emailError) {
			throw new HttpException(
				`Failed to send OTP email to ${email}: ${emailError.message}`,
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async register(registerDto: RegisterDto) {
		const { email, role } = registerDto;
		await this.checkExistingUser(email);
		await this.checkAdminRole(role);

		const otp = this.generateOtp();
		await this.sendOtp(email, otp);

		await this.usersService.create({ ...registerDto, otp });
	}

	private getOtpExpiryTime(otpCreatedAt: Date): Date {
		const otpExpiryTime = new Date(otpCreatedAt);
		otpExpiryTime.setMinutes(otpExpiryTime.getMinutes() + 5);
		return otpExpiryTime;
	}

	async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<void> {
		const { email, otp } = verifyOtpDto;
		const user = await this.usersRepository.findOne({ where: { email } });

		if (!user) throw new NotFoundException('User not found');
		if (new Date() > this.getOtpExpiryTime(user.otpCreatedAt))
			throw new HttpException('OTP expired', HttpStatus.UNAUTHORIZED);
		if (user.otp !== otp) throw new BadRequestException('Invalid OTP');

		user.isVerified = true;
		user.otp = null;
		await this.usersRepository.save(user);
	}

	async resendOtp(resendOtpDto: ResendOtpDto): Promise<void> {
		const { email } = resendOtpDto;
		const user = await this.usersRepository.findOne({ where: { email } });

		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		if (new Date() < this.getOtpExpiryTime(user.otpCreatedAt))
			throw new HttpException(
				'OTP is still valid, please wait until it expires',
				HttpStatus.BAD_REQUEST,
			);

		const otp = this.generateOtp();
		user.otp = otp;
		user.otpCreatedAt = new Date();
		await this.usersRepository.save(user);

		await this.sendOtp(email, otp);
	}
}
