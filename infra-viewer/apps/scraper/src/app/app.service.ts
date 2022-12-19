import { Injectable, OnModuleInit } from "@nestjs/common";
import { ScraperService } from "./scraper.service";
import { logger } from "nx/src/utils/logger";

@Injectable()
export class AppService implements OnModuleInit {

  constructor(private scrapeService: ScraperService) {
  }

  onModuleInit(): any {
    this.scrapeService.run().then(() => logger.info("Done!"));
  }
}
