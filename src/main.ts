import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {
	SwaggerModule,
	DocumentBuilder,
	SwaggerDocumentOptions,
} from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
		}),
	);

	if (process.env.SENTRY_ENVIRONMENT) {
		Sentry.init({
			dsn: process.env.SENTRY_DNS,
			environment: process.env.SENTRY_ENVIRONMENT || 'production',
			integrations: [nodeProfilingIntegration()],

			tracesSampleRate: 1.0,

			profilesSampleRate: 1.0,
		});
	}
	const config = new DocumentBuilder()
		.setTitle('E_Commerce')
		.setDescription('An E_commerce application for developers')
		.setVersion('1.0')
		.addBearerAuth(
			{ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
			'authenticationToken',
		)
		.build();

	const swaggerOptions: SwaggerDocumentOptions = {
		operationIdFactory: (controllerKey: string, methodKey: string) =>
			methodKey,
	};
	const document = SwaggerModule.createDocument(app, config, swaggerOptions);
	SwaggerModule.setup('api-docs', app, document);

	await app.listen(3000);
}
bootstrap();
