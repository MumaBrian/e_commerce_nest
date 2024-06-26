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
}
