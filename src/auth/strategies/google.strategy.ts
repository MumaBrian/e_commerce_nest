import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { AppConfigService } from 'src/config/config.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
	private readonly logger = new Logger(GoogleStrategy.name);

	constructor(
		private readonly authService: AuthService,
		private readonly configService: AppConfigService,
	) {
		super({
			clientID: configService.googleClientId,
			clientSecret: configService.googleClientSecret,
			callbackURL: configService.googleCallBackUrl,
			scope: ['email', 'profile'],
		});
	}

	async validate(
		accessToken: string,
		refreshToken: string,
		profile: any,
		done: VerifyCallback,
	): Promise<any> {
		try {
			const { name, emails, photos } = profile;
			if (!emails || !emails.length) {
				this.logger.error('No email found in Google profile');
				return done(
					new Error('No email found in Google profile'),
					null,
				);
			}
			const user = {
				email: emails[0].value,
				firstName: name?.givenName || '',
				lastName: name?.familyName || '',
				picture: photos?.[0]?.value || '',
				accessToken,
			};
			this.logger.log(`Google user: ${JSON.stringify(user)}`);
			const authUser = await this.authService.validateOAuthLogin(user);
			done(null, authUser);
		} catch (error) {
			this.logger.error('Error validating Google profile', error);
			done(error, false);
		}
	}
}
