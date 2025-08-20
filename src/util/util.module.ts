import { Module } from '@nestjs/common';
import { UtilService } from './util.service';
import { TelegrafModule } from 'nestjs-telegraf';

@Module({
  providers: [UtilService],
  imports: [TelegrafModule],
  exports: [UtilService],
})
export class UtilModule {}
