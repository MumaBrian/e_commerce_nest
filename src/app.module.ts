import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './config/config.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './products/products.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { CategoriesModule } from './categories/categories.module';
import { CustomerModule } from './customer/customer.module';
import { AdminModule } from './admin/admin.module';
// import { SentryExceptionFilter } from './common/filters/sentry-exception.filter';
import { OrdersModule } from './orders/orders.module';
import { OrderitemsModule } from './orderitems/orderitems.module';
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
		OrdersModule,
		OrderitemsModule,
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
	],
})
export class AppModule {}
