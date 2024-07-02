import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { AppConfigService } from 'src/config/config.service';

@Module({
	providers: [MailService, AppConfigService],
	exports: [MailService],
})
export class MailModule {}
