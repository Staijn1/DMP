import {Injectable} from '@nestjs/common';
import {SystemConfiguration} from '@infra-viewer/interfaces';
import * as fs from 'fs';

@Injectable()
export class SystemService {
  async getConfiguration(): Promise<SystemConfiguration> {
    // Read contents of configuration.json from root of project
    const contents =  await fs.promises.readFile('../../../SystemConfiguration.json');
    // Deserialize the JSON into a SystemConfiguration object
    return JSON.parse(contents.toString());
  }

  async setConfiguration(configuration: SystemConfiguration): Promise<void> {
    // Serialize the configuration object to JSON and write it to the configuration.json file in the root of the project
    const serialized = JSON.stringify(configuration);
    await fs.promises.writeFile('../../../SystemConfiguration.json', serialized);
  }
}
