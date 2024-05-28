import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';

@Module({
	providers: [UsersService, AuthService],
	controllers: [UsersController, AuthController],
})
export class UsersModule {}
