import SceneLayerProperties from '@arcgis/core/layers/SceneLayer';
import FeatureLayerProperties from '@arcgis/core/layers/FeatureLayer';
import GeoJSONLayerProperties from '@arcgis/core/layers/GeoJSONLayer';
import Layer from '@arcgis/core/layers/Layer';

export class SystemConfiguration {
  // @ApiProperty()
  layers!: LayerConfig[]
}

export type LayerConfig = SceneLayerProperties | FeatureLayerProperties | GeoJSONLayerProperties

export type SystemConfigurationLayerTypes =
  'scene'
  | 'feature'
  | 'geoJSON'
  | 'elevation'

export type LayerConstructor = {
  [key in SystemConfigurationLayerTypes]: () => Layer
};
