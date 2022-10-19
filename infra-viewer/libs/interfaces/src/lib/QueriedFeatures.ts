import FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import FeatureLayerProperties from '@arcgis/core/layers/FeatureLayer';

export type QueriedFeatures = {
  featureSet: FeatureSet,
  layer: FeatureLayerProperties
}
