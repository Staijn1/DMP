import {ApiProperty} from '@nestjs/swagger';
import SceneLayerProperties from '@arcgis/core/layers/SceneLayer';
import FeatureLayerProperties from '@arcgis/core/layers/FeatureLayer';
import ElevationLayerProperties from '@arcgis/core/layers/ElevationLayer';
import GeoJSONLayerProperties from '@arcgis/core/layers/GeoJSONLayer';

export class SystemConfiguration {
  @ApiProperty()
  scenelayers!: SceneLayerProperties[];
  @ApiProperty()
  featurelayers!: FeatureLayerProperties[];
  @ApiProperty()
  elevationLayer!: ElevationLayerProperties;
  @ApiProperty()
  geoJSONLayers!: GeoJSONLayerProperties[];
}


export type SystemConfigurationLayerTypes =
  'scenelayers'
  | 'featurelayers'
  | 'geoJSONLayers'
