import { Module } from "@nestjs/common";

import { AppService } from "./app.service";
import { ScraperService } from "./scraper.service";
import { HttpModule } from "nestjs-http-promise";

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [AppService, ScraperService]
})
export class AppModule {
}
