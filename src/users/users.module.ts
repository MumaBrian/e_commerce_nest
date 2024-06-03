import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../database/entities/user.entity';
import { AuthController } from 'src/auth/auth.controller';
import { AuthModule } from 'src/auth/auth.module';
@Module({
	imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
	controllers: [UsersController, AuthController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
