import { IsString, IsNotEmpty, IsNumber, IsEnum } from 'class-validator';
import { OrderStatus } from 'src/database/enums/order-status.enum';
import { PaymentMethod } from 'src/database/enums/payment-method.enum';

export class CreateOrderDto {
	@IsString()
	@IsNotEmpty()
	customerId: string;

	@IsString()
	@IsNotEmpty()
	itemsId: string;

	@IsNumber()
	total: number;

	@IsEnum(OrderStatus)
	orderStatus: OrderStatus;

	@IsEnum(PaymentMethod)
	PaymentMethod: PaymentMethod;
}
