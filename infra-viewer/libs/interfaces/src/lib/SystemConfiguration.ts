import SceneLayerProperties from "@arcgis/core/layers/SceneLayer";
import FeatureLayerProperties from "@arcgis/core/layers/FeatureLayer";
import SceneView from "@arcgis/core/views/SceneView";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import CameraProperties = __esri.CameraProperties;
import MapImageLayerProperties = __esri.MapImageLayerProperties;
import SceneViewEnvironment = __esri.SceneViewEnvironment;


export class SystemConfiguration {
  layers!: LayerConfig[];
  view!: {
    camera: CameraProperties;
    qualityProfile: Pick<SceneView, "qualityProfile">
    environment: SceneViewEnvironment
  };
  authorization!: {
    requireAuthorization: boolean,
    portalUrl: string,
    portalSharingUrl: string
  };
}

export type LayerConfig =
  CustomLayerConfig<SceneLayerProperties>
  | CustomLayerConfig<FeatureLayerProperties>
  | CustomLayerConfig<MapImageLayerProperties & { type: "map-image" }>;

export type SystemConfigurationLayerTypes =
  "scene"
  | "feature"
  | "geoJSON"
  | "elevation"
  | "map-image"

export type DeepWritable<T> = { -readonly [P in keyof T]: DeepWritable<T[P]> };

export type CustomLayerConfig<T> = DeepWritable<T> & {
  renderer: DeepWritable<SimpleRenderer>
}
