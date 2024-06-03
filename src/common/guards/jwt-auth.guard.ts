import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

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
			return true;
		}
		const request = context.switchToHttp().getRequest();
		const token = request.headers.authorization?.split(' ')[1];
		if (!token) {
			return false;
		}
		const user = this.jwtService.verify(token);
		return roles.includes(user.roles);
	}
}
