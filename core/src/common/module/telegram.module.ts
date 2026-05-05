import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TelegramService } from '../service/telegram.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}