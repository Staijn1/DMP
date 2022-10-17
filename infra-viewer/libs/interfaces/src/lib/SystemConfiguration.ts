import {ApiProperty} from '@nestjs/swagger';
import SceneLayerProperties from '@arcgis/core/layers/SceneLayer';
import FeatureLayerProperties = __esri.FeatureLayerProperties;
import ElevationLayerProperties = __esri.ElevationLayerProperties;
import GeoJSONLayerProperties = __esri.GeoJSONLayerProperties;

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
