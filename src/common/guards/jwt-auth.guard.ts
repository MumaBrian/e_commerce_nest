import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { jwtConstants } from '../constants/constants';
@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(
		private jwtService: JwtService,
		private reflector: Reflector,
	) {}

	canActivate(context: ExecutionContext): boolean {
		const roles = this.reflector.get<string[]>(
			'roles',
			context.getHandler(),
		);
		if (!roles) {
			console.error('No roles defined, allowing access');
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const authHeader = request.headers.authorization;

		if (!authHeader) {
			throw new UnauthorizedException('Authorization header not found');
		}

		const token = authHeader.split(' ')[1];
		if (!token) {
			throw new UnauthorizedException('Token not found');
		}

		try {
			console.log('JwtAuthGuard: Verifying token');
			const user = this.jwtService.verify(token, {
				secret: jwtConstants.secret,
			});

			if (!roles.includes(user.roles)) {
				console.error(
					'JwtAuthGuard: User does not have the required roles',
				);
				throw new ForbiddenException(
					'User does not have the required roles',
				);
			}

			request.user = user;
			return true;
		} catch (error) {
			throw new ForbiddenException('Invalid token:', error.message);
		}
	}
}
