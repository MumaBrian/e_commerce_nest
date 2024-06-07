import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './config/config.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './products/products.module';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { CategoriesModule } from './categories/categories.module';
import { CustomerModule } from './customer/customer.module';
import { AdminModule } from './admin/admin.module';
import { SentryExceptionFilter } from './common/filters/sentry-exception.filter';
@Module({
	imports: [
		AppConfigModule,
		DatabaseModule,
		AuthModule,
		UsersModule,
		ProductsModule,
		CategoriesModule,
		CustomerModule,
		AdminModule,
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
		{
			provide: APP_FILTER,
			useClass: SentryExceptionFilter,
		},
	],
})
export class AppModule {}
