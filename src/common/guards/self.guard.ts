import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class SelfGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();
		const user = request.user;
		const userId = request.params.id;

		if (user.roles === 'admin' || user.sub === userId) {
			return true;
		} else {
			throw new ForbiddenException(
				'You are not allowed to edit this data',
			);
		}
	}
}
