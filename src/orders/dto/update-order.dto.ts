import { IsString, IsNotEmpty, IsNumber, IsEnum } from 'class-validator';
import { OrderStatus } from 'src/database/enums/order-status.enum';
import { PaymentMethod } from 'src/database/enums/payment-method.enum';

export class UpdateOrderDto {
	@IsString()
	@IsNotEmpty()
	ItemsId?: string;

	@IsNumber()
	total?: number;

	@IsEnum(OrderStatus)
	orderStatus?: OrderStatus;

	@IsEnum(PaymentMethod)
	PaymentMethod?: PaymentMethod;
}
