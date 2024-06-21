import { Module } from '@nestjs/common';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';
import { Receipt } from 'src/database/entities/receipt.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Order } from 'src/database/entities/order.entity';
import { Payment } from 'src/database/entities/payment.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Receipt, Order, Payment]), AuthModule],
	controllers: [ReceiptsController],
	providers: [ReceiptsService],
})
export class ReceiptsModule {}
