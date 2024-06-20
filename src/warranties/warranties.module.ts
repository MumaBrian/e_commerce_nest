import { Module } from '@nestjs/common';
import { WarrantiesController } from './warranties.controller';
import { WarrantiesService } from './warranties.service';
import { Warranty } from 'src/database/entities/warranty.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';

@Module({
	imports: [TypeOrmModule.forFeature([Warranty]), AuthModule],
	controllers: [WarrantiesController],
	providers: [WarrantiesService],
})
export class WarrantiesModule {}
