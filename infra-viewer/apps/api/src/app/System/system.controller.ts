import {Controller, Get} from '@nestjs/common';
import {SystemService} from './system.service';
import {SystemConfiguration} from '@infra-viewer/interfaces';

@Controller('System')
export class SystemController {
  constructor(private readonly systemService: SystemService) {
  }

  @Get('Configuration')
  async getConfiguration(): Promise<SystemConfiguration> {
    return this.systemService.getConfiguration();
  }
}
