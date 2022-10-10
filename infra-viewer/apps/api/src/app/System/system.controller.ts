import {Body, Controller, Get, Post} from '@nestjs/common';
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

  @Post('Configuration')
  async uploadConfiguration(@Body() configuration: SystemConfiguration): Promise<void> {
    return this.systemService.setConfiguration(configuration);
  }
}
