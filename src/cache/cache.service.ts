import { Injectable, Inject, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { AppConfigService } from 'src/config/config.service';

@Injectable()
export class CacheService {
	private readonly logger = new Logger(CacheService.name);
	private readonly ttl: number;

	constructor(
		@Inject('REDIS_CLIENT') private readonly redisClient: Redis,
		private readonly configService: AppConfigService,
	) {
		this.ttl = this.configService.redisTtl;
	}

	async get(key: string): Promise<string | null> {
		const value = await this.redisClient.get(key);
		if (value) {
			this.logger.log(`Cache hit for key: ${key}`);
		} else {
			this.logger.log(`Cache miss for key: ${key}`);
		}
		return value;
	}

	async set(key: string, value: string, customTtl?: number): Promise<void> {
		const ttl = customTtl || this.ttl;
		await this.redisClient.set(key, value, 'EX', ttl);
		this.logger.log(`Cache set for key: ${key} with TTL: ${ttl}`);
	}

	async del(key: string): Promise<void> {
		await this.redisClient.del(key);
		this.logger.log(`Cache deleted for key: ${key}`);
	}
}
