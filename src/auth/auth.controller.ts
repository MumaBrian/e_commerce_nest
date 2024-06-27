import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ApiTags } from '@nestjs/swagger';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	async login(@Body() loginDto: LoginDto) {
		return this.authService.login(loginDto);
	}

	@Post('register')
	async register(@Body() registerDto: RegisterDto) {
		return this.authService.register(registerDto);
	}

	@Post('verify-otp')
	async verifyOtp(
		@Body() verifyOtpDto: VerifyOtpDto,
	): Promise<{ message: string }> {
		await this.authService.verifyOtp(verifyOtpDto);
		return { message: 'Email verified successfully' };
	}

	@Post('resend-otp')
	async resendOtp(
		@Body() resendOtp: ResendOtpDto,
	): Promise<{ message: string }> {
		await this.authService.resendOtp(resendOtp);
		return { message: 'OTP has been resent' };
	}
}
