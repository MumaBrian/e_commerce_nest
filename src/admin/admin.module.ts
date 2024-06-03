import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { Product } from 'src/database/entities/product.entity';
import { Category } from 'src/database/entities/category.entity';
import { Warranty } from 'src/database/entities/warranty.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/database/entities/user.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Category, Product, User, Warranty]),
		AuthModule,
	],
	providers: [AdminService],
	controllers: [AdminController],
})
export class AdminModule {}
