import {
	Controller,
	Post,
	Body,
	UseGuards,
	Get,
	Req,
	Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ApiTags } from '@nestjs/swagger';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

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

	@Get('google')
	@UseGuards(AuthGuard('google'))
	async googleAuth(@Req() req) {}

	@Get('google/redirect')
	@UseGuards(AuthGuard('google'))
	async googleAuthRedirect(@Req() req, @Res() res: Response) {
		const jwt = await this.authService.login(req.user);
		res.redirect(
			`http://localhost:3000/api-docs#/?token=${jwt.access_token}`,
		);
	}
}
