import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { AppConfigService } from 'src/config/config.service';

@Injectable()
export class MailService {
	private transporter: nodemailer.Transporter;

	constructor(private readonly configService: AppConfigService) {
		this.transporter = nodemailer.createTransport({
			host: this.configService.emailHost,
			port: this.configService.emailPort,
			secure: true,
			auth: {
				user: this.configService.emailUser,
				pass: this.configService.emailPassword,
			},
			tls: {
				rejectUnauthorized: false,
			},
		});
		console.log(
			`Email configuration - Host: ${this.configService.emailHost}, Port: ${this.configService.emailPort}`,
		);
	}

	async sendOtp(email: string, otp: string) {
		try {
			const info = await this.transporter.sendMail({
				from: this.configService.emailUser,
				to: email,
				subject: this.configService.emailSubject,
				text: `Your OTP code is ${otp}`,
			});
			console.log(
				`OTP email sent successfully to ${email}: ${info.response}`,
			);
		} catch (error) {
			console.error(
				`Failed to send OTP email to ${email}: ${error.message}`,
			);
			throw error;
		}
	}

	async sendPasswordReset(email: string, token: string) {
		try {
			const resetUrl = `http://your-app-url/reset-password?token=${token}`;
			const info = await this.transporter.sendMail({
				from: this.configService.emailUser,
				to: email,
				subject: 'Password Reset',
				text: `You requested a password reset. Click this link to reset your password: ${resetUrl}`,
			});
			console.log(
				`Password reset email sent successfully to ${email}: ${info.response}`,
			);
		} catch (error) {
			console.error(
				`Failed to send password reset email to ${email}: ${error.message}`,
			);
			throw error;
		}
	}
}
