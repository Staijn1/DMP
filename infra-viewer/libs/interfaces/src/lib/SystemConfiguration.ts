import {ApiProperty} from '@nestjs/swagger';
import SceneLayerProperties from '@arcgis/core/layers/SceneLayer';
import FeatureLayerProperties from '@arcgis/core/layers/FeatureLayer';
import GeoJSONLayerProperties from '@arcgis/core/layers/GeoJSONLayer';

export class SystemConfiguration {
  @ApiProperty()
  scenelayers!: SceneLayerProperties[];
  @ApiProperty()
  featurelayers!: FeatureLayerProperties[];
  @ApiProperty()
  elevationLayer!: any;
  @ApiProperty()
  geoJSONLayers!: GeoJSONLayerProperties[];
}


export type SystemConfigurationLayerTypes =
  'scenelayers'
  | 'featurelayers'
  | 'geoJSONLayers'
