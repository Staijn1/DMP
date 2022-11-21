import FL from '@arcgis/core/layers/FeatureLayer';
import Query from '@arcgis/core/rest/support/Query';

export interface CustomFeatureLayer extends FL {
  affects?: { id: string, strategy: string }[];
}

export type SpatialRelationship = Query['spatialRelationship']


export interface HubItem {
  accessInformation?: any;
  categories: string[];
  created: number;
  description?: string;
  extent: number[][];
  id: string;
  licenseInfo?: any;
  modified: number;
  name?: string;
  owner: string;
  ownerFolder?: any;
  snippet: string;
  spatialReference: string;
  tags: string[];
  thumbnail: string;
  title: string;
  type: string;
  typeKeywords: string[];
  url: string;

  toJSON(): any;
}

