import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { jwtConstants } from 'src/common/constants/constants';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
@Module({
	imports: [
		forwardRef(() => UsersModule),
		PassportModule,
		JwtModule.register({
			secret: jwtConstants.secret,
			signOptions: { expiresIn: '24h' },
		}),
	],
	providers: [AuthService, JwtStrategy, LocalStrategy, JwtAuthGuard],
	controllers: [AuthController],
	exports: [AuthService],
})
export class AuthModule {}
