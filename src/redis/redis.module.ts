import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';

@Global()
@Module({
	imports: [ConfigModule],
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
	],
	exports: ['REDIS_CLIENT'],
})
export class RedisModule {}

// import { Module, Global } from '@nestjs/common';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import Redis from 'ioredis';

// @Global()
// @Module({
// 	imports: [ConfigModule],
// 	providers: [
// 		{
// 			provide: 'REDIS_CLIENT',
// 			useFactory: async (
// 				configService: ConfigService,
// 			): Promise<Redis> => {
// 				return new Redis({
// 					host: configService.get<string>('REDIS_HOST'),
// 					port: configService.get<number>('REDIS_PORT'),
// 					password: configService.get<string>('REDIS_PASSWORD'), // Add this line
// 				});
// 			},
// 			inject: [ConfigService],
// 		},
// 	],
// 	exports: ['REDIS_CLIENT'],
// })
// export class RedisModule {}
