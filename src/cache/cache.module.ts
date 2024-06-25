import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfigModule } from 'src/config/config.module';
import Redis, { RedisOptions } from 'ioredis';
import { CacheService } from './cache.service';

@Global()
@Module({
	imports: [ConfigModule, AppConfigModule],
	providers: [
		{
			provide: 'REDIS_CLIENT',
			useFactory: async (
				configService: ConfigService,
			): Promise<Redis> => {
				const redisConfig: RedisOptions = {
					host: configService.get<string>('redis.host'),
					port: configService.get<number>('redis.port'),
					password: configService.get<string>('redis.password'),
				};

				const client = new Redis(redisConfig);

				return client;
			},
			inject: [ConfigService],
		},
		CacheService,
	],
	exports: ['REDIS_CLIENT', CacheService],
})
export class CacheModule {}
