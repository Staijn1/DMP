import FL from '@arcgis/core/layers/FeatureLayer';

export interface CustomFeatureLayer extends FL {
  affects?: string[];
}
