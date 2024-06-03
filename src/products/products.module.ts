import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from '../database/entities/product.entity';
import { Category } from '../database/entities/category.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Image } from 'src/database/entities/image.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Product, Category, Image]), AuthModule],
	controllers: [ProductsController],
	providers: [ProductsService],
})
export class ProductsModule {}
