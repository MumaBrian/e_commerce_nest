import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
	constructor(private configService: ConfigService) {}

	get databaseType(): string {
		return this.configService.get<string>('database.type');
	}

	get databaseHost(): string {
		return this.configService.get<string>('database.host');
	}

	get databasePort(): number {
		return this.configService.get<number>('database.port');
	}

	get databaseUsername(): string {
		return this.configService.get<string>('database.username');
	}

	get databasePassword(): string {
		return this.configService.get<string>('database.password');
	}

	get databaseName(): string {
		return this.configService.get<string>('database.database');
	}

	get jwtSecret(): string {
		return this.configService.get<string>('jwt.secret');
	}

	get jwtExpiresIn(): string {
		return this.configService.get<string>('jwt.expiresIn');
	}

	get corsOrigin(): string {
		return this.configService.get<string>('cors.origin');
	}

	get port(): number {
		return this.configService.get<number>('port');
	}

	get redisHost(): string {
		return this.configService.get<string>('redis.host');
	}

	get redisPort(): number {
		return this.configService.get<number>('redis.port');
	}

	get redisTtl(): number {
		return this.configService.get<number>('redis.ttl');
	}
	get redisPassword(): string {
		return this.configService.get<string>('redis.password');
	}

	get emailHost(): string {
		return this.configService.get<string>('email.host');
	}

	get emailSubject(): string {
		return this.configService.get<string>('email.subject');
	}

	get emailText(): string {
		return this.configService.get<string>('email.text');
	}

	get emailHtml(): string {
		return this.configService.get<string>('email.html');
	}

	get emailPort(): number {
		return this.configService.get<number>('email.port');
	}

	get emailPassword(): string {
		return this.configService.get<string>('email.password');
	}

	get emailUser(): string {
		return this.configService.get<string>('email.user');
	}

	get googleClientId(): string {
		return this.configService.get<string>('google.client_id');
	}

	get googleClientSecret(): string {
		return this.configService.get<string>('google.client_secret');
	}

	get googleCallBackUrl(): string {
		return this.configService.get<string>('google.call_back_url');
	}
}
