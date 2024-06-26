import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from '../database/entities/product.entity';
import { Category } from '../database/entities/category.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Image } from 'src/database/entities/image.entity';
import { CacheModule } from 'src/cache/cache.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Product, Category, Image]),
		AuthModule,
		CacheModule,
	],
	controllers: [ProductsController],
	providers: [ProductsService],
})
export class ProductsModule {}
