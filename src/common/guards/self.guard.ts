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
		console.log('userId: ' + userId);
		if (user.userId !== userId) {
			throw new ForbiddenException(
				'You are not allowed to edit this data',
			);
		}
		return true;
	}
}
