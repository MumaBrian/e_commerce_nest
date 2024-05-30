import { Injectable } from '@nestjs/common';
import * as mailgun from 'mailgun-js';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OtpService {
	private otps = new Map<string, string>();
	private mg;

	constructor(private configService: ConfigService) {
		this.mg = mailgun({
			apiKey: this.configService.get<string>('MAILGUN_API_KEY'),
			domain: this.configService.get<string>('MAILGUN_DOMAIN'),
		});
	}

	async sendOtp(email: string): Promise<void> {
		const otp = uuidv4().split('-')[0];
		this.otps.set(email, otp);

		const data = {
			from: 'noreply@yourdomain.com',
			to: email,
			subject: 'Your OTP Code',
			text: `Your OTP code is ${otp}`,
		};
		await this.mg.messages().send(data);
	}

	async verifyOtp(email: string, otp: string): Promise<boolean> {
		const storedOtp = this.otps.get(email);
		if (storedOtp === otp) {
			this.otps.delete(email);
			return true;
		}
		return false;
	}
}
