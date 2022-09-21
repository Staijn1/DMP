import { Module } from '@nestjs/common';

import {SystemModule} from './System/system.module';

@Module({
  imports: [SystemModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
