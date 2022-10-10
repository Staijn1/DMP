import {Injectable} from '@nestjs/common';
import {SystemConfiguration} from '@infra-viewer/interfaces';
import * as fs from 'fs';
import path = require('path');

@Injectable()
export class SystemService {
  private readonly assetPath: string;
  private readonly configurationFilePath: string;

  constructor() {
    this.assetPath = path.join(__filename, '../assets');
    this.configurationFilePath = path.join(this.assetPath, 'SystemConfiguration.json');
  }

  async getConfiguration(): Promise<SystemConfiguration> {
    // Read contents of configuration.json from assets folder
    const contents = await fs.promises.readFile(this.configurationFilePath);
    // Deserialize the JSON into a SystemConfiguration object
    return JSON.parse(contents.toString());
  }

  async setConfiguration(configuration: SystemConfiguration): Promise<void> {
    // Serialize the configuration object to JSON and write it to the configuration.json file in the root of the project
    const serialized = JSON.stringify(configuration);
    await fs.promises.writeFile(this.configurationFilePath, serialized);
  }
}
