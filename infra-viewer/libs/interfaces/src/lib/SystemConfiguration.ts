import SceneLayerProperties from '@arcgis/core/layers/SceneLayer';
import FeatureLayerProperties from '@arcgis/core/layers/FeatureLayer';
import Layer from '@arcgis/core/layers/Layer';
import SceneView from '@arcgis/core/views/SceneView';
import CameraProperties = __esri.CameraProperties;
import MapImageLayerProperties = __esri.MapImageLayerProperties;


export class SystemConfiguration {
  layers!: LayerConfig[];
  view!: {
    camera: CameraProperties;
    qualityProfile: Pick<SceneView, 'qualityProfile'>
    environment: Pick<SceneView, 'environment'>
  };
}

export type LayerConfig = Mutable<SceneLayerProperties> | Mutable<FeatureLayerProperties> | Mutable<MapImageLayerProperties & {type: 'map-image'}>;

export type SystemConfigurationLayerTypes =
  'scene'
  | 'feature'
  | 'geoJSON'
  | 'elevation'
  | 'map-image'

type Mutable<T> = { -readonly [P in keyof T]: T[P] };
