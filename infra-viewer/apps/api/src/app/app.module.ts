import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';

import { SystemModule } from './System/system.module';
import {LoggerMiddleware} from './middleware/logger.middleware';

@Module({
  imports: [SystemModule],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
