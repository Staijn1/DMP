import {Injectable, Logger, NestMiddleware} from '@nestjs/common';

import {Request, Response} from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    const {ip, method, path: url} = req;
    const userAgent = req.get('user-agent') || '';

    res.on('close', () => {
      const {statusCode} = res;
      const contentLength = res.get('content-length');

      Logger.log(
        `${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${ip}`
      );
    });
    next();
  }
}
