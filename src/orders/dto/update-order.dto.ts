import {
	IsString,
	IsNotEmpty,
	IsNumber,
	IsEnum,
	IsOptional,
} from 'class-validator';
import { OrderStatus } from 'src/database/enums/order-status.enum';
import { PaymentMethod } from 'src/database/enums/payment-method.enum';

export class UpdateOrderDto {
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	ItemsId?: string[];

	@IsNumber()
	@IsOptional()
	total?: number;

	@IsEnum(OrderStatus)
	@IsOptional()
	orderStatus?: OrderStatus;

	@IsEnum(PaymentMethod)
	@IsOptional()
	PaymentMethod?: PaymentMethod;
}
