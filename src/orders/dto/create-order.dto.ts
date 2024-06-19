import {
	IsString,
	IsNotEmpty,
	IsEnum,
	ArrayNotEmpty,
	IsArray,
} from 'class-validator';
import { OrderStatus } from 'src/database/enums/order-status.enum';
import { PaymentMethod } from 'src/database/enums/payment-method.enum';

export class CreateOrderDto {
	@IsString()
	@IsNotEmpty()
	customerId: string;

	@IsArray()
	@ArrayNotEmpty()
	@IsString({ each: true })
	orderItemsId: string[];

	@IsEnum(OrderStatus)
	orderStatus: OrderStatus;

	@IsEnum(PaymentMethod)
	paymentMethod: PaymentMethod;
}
