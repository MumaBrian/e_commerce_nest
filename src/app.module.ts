import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './config/config.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
@Module({
	imports: [AppConfigModule, DatabaseModule, AuthModule, UsersModule],
})
export class AppModule {}
