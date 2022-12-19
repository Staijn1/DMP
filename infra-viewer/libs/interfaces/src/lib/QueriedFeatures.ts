import FeatureSet from "@arcgis/core/rest/support/FeatureSet";
import FeatureLayerProperties from "@arcgis/core/layers/FeatureLayer";
import SceneLayerProperties from "@arcgis/core/layers/SceneLayer";

export type QueriedFeatures = {
  featureSet: FeatureSet,
  layer: FeatureLayerProperties | SceneLayerProperties
}
