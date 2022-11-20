import FL from '@arcgis/core/layers/FeatureLayer';
import Query from '@arcgis/core/rest/support/Query';

export interface CustomFeatureLayer extends FL {
  affects?: { id: string, strategy: string }[];
}

export type SpatialRelationship = Query['spatialRelationship']
