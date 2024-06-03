import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from '../database/entities/category.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
@Module({
	imports: [TypeOrmModule.forFeature([Category])],
	controllers: [CategoriesController],
	providers: [CategoriesService, JwtAuthGuard, JwtService],
})
export class CategoriesModule {}
