import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { Image } from '../database/entities/image.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Product } from 'src/database/entities/product.entity';
@Module({
	imports: [TypeOrmModule.forFeature([Image, Product]), AuthModule],
	controllers: [ImagesController],
	providers: [ImagesService],
})
export class ImagesModule {}
