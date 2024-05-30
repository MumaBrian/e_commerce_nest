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
}
