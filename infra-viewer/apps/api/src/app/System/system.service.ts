import { Injectable } from '@nestjs/common';
import { SystemConfiguration } from '@infra-viewer/interfaces';

@Injectable()
export class SystemService {
  async getConfiguration(): Promise<SystemConfiguration> {
    // Read contents of configuration.json from root of project
    return await import('../../../SystemConfiguration.json');
  }
}
