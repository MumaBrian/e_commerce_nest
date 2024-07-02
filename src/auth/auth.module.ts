import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { jwtConstants } from 'src/common/constants/constants';
import { MailModule } from 'src/mail/mail.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { GoogleStrategy } from './strategies/google.strategy';
import { AppConfigModule } from 'src/config/config.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		forwardRef(() => UsersModule),
		PassportModule,
		JwtModule.register({
			secret: jwtConstants.secret,
			signOptions: { expiresIn: '24h' },
		}),
		MailModule,
		AppConfigModule,
	],
	providers: [AuthService, JwtStrategy, LocalStrategy, GoogleStrategy],
	controllers: [AuthController],
	exports: [AuthService, JwtModule],
})
export class AuthModule {}
