import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Order } from 'src/database/entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Payment } from 'src/database/entities/payment.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Order, Payment]), AuthModule],
	providers: [PaymentsService],
	controllers: [PaymentsController],
})
export class PaymentsModule {}
