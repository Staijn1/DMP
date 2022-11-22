import SceneLayerProperties from '@arcgis/core/layers/SceneLayer';
import FeatureLayerProperties from '@arcgis/core/layers/FeatureLayer';
import GeoJSONLayerProperties from '@arcgis/core/layers/GeoJSONLayer';
import Layer from '@arcgis/core/layers/Layer';
import SceneView from '@arcgis/core/views/SceneView';
import CameraProperties = __esri.CameraProperties;


export class SystemConfiguration {
  layers!: LayerConfig[];
  view!: {
    camera: CameraProperties;
    qualityProfile: Pick<SceneView, 'qualityProfile'>
    environment: Pick<SceneView, 'environment'>
  };
}

export type LayerConfig = SceneLayerProperties | FeatureLayerProperties | GeoJSONLayerProperties

export type SystemConfigurationLayerTypes =
  'scene'
  | 'feature'
  | 'geoJSON'
  | 'elevation'
  | 'map-image'

export type LayerConstructor = {
  [key in SystemConfigurationLayerTypes]: () => Layer
};
