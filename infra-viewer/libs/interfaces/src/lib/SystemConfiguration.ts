// import SceneLayerProperties from '@arcgis/core/interfaces';

import {ApiProperty} from '@nestjs/swagger';

export class SystemConfiguration {
  @ApiProperty()
  scenelayers!: any[];
  @ApiProperty()
  featurelayers!: any[];
  @ApiProperty()
  elevationLayer!: { url: string } & any;
  @ApiProperty()
  geoJSONLayers!: any[];
}

export type SystemConfigurationLayerTypes =
  'scenelayers'
  | 'featurelayers'
  | 'geoJSONLayers'
