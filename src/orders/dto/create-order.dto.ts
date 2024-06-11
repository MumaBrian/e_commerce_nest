import {
	IsString,
	IsNotEmpty,
	IsNumber,
	IsEnum,
	ValidateNested,
} from 'class-validator';
import { OrderStatus } from 'src/database/enums/order-status.enum';
import { PaymentMethod } from 'src/database/enums/payment-method.enum';
import { CreateOrderItemDto } from 'src/orderitems/dto/create-order-item.dto';
import { Type } from 'class-transformer';

export class CreateOrderDto {
	@IsString()
	@IsNotEmpty()
	customerId: string;

	@ValidateNested({ each: true })
	@Type(() => CreateOrderItemDto)
	items: CreateOrderItemDto[];

	@IsNumber()
	total: number;

	@IsEnum(OrderStatus)
	orderStatus: OrderStatus;

	@IsEnum(PaymentMethod)
	paymentMethod: PaymentMethod;
}
