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
import { Response } from 'express';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RefreshTokenDto } from './dto/refresh-token.dto';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	@UseGuards(ThrottlerGuard)
	async login(@Body() loginDto: LoginDto) {
		return this.authService.login(loginDto);
	}

	@Post('register')
	@UseGuards(ThrottlerGuard)
	async register(@Body() registerDto: RegisterDto) {
		return this.authService.register(registerDto);
	}

	@Post('verify-otp')
	@UseGuards(ThrottlerGuard)
	async verifyOtp(
		@Body() verifyOtpDto: VerifyOtpDto,
	): Promise<{ message: string }> {
		await this.authService.verifyOtp(verifyOtpDto);
		return { message: 'Email verified successfully' };
	}

	@Post('resend-otp')
	@UseGuards(ThrottlerGuard)
	async resendOtp(
		@Body() resendOtp: ResendOtpDto,
	): Promise<{ message: string }> {
		await this.authService.resendOtp(resendOtp);
		return { message: 'OTP has been resent' };
	}

	@Get('google')
	@UseGuards(AuthGuard('google'), ThrottlerGuard)
	async googleAuth(@Req() req) {}

	@Get('google/redirect')
	@UseGuards(AuthGuard('google'))
	async googleAuthRedirect(@Req() req, @Res() res: Response) {
		const jwt = await this.authService.login(req.user);
		res.redirect(
			`http://localhost:3000/api-docs#/?token=${jwt.access_token}`,
		);
	}

	@Post('refresh-token')
	async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
		return this.authService.refreshToken(refreshTokenDto);
	}

	@Post('forgot-password')
	@UseGuards(ThrottlerGuard)
	async forgotPassword(
		@Body() forgotPasswordDto: ForgotPasswordDto,
	): Promise<{ message: string }> {
		await this.authService.forgotPassword(forgotPasswordDto);
		return { message: 'Password reset link sent to email' };
	}

	@Post('reset-password')
	@UseGuards(ThrottlerGuard)
	async resetPassword(
		@Body() resetPasswordDto: ResetPasswordDto,
	): Promise<{ message: string }> {
		await this.authService.resetPassword(resetPasswordDto);
		return { message: 'Password reset successfully' };
	}
}
