import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import {SystemModule} from './System/system.module';

@Module({
  imports: [SystemModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
