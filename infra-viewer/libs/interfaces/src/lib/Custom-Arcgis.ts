import FL from '@arcgis/core/layers/FeatureLayer';
import Query from '@arcgis/core/rest/support/Query';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import Layer from '@arcgis/core/layers/Layer';
import Extent from '@arcgis/core/geometry/Extent';
import Field from '@arcgis/core/layers/support/Field';

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


export interface DocumentInfo {
  Title: string;
  Author: string;
  Comments: string;
  Subject: string;
  Category: string;
  AntialiasingMode: string;
  TextAntialiasingMode: string;
  Version: string;
  Keywords: string;
}

export interface ArchivingInfo {
  supportsHistoricMoment: boolean;
}

export interface ServiceInfoLayer {
  id: string;
  name: string;
  parentLayerId: string;
  defaultVisibility: boolean;
  subLayerIds: number[];
  minScale: number;
  maxScale: number;
  type: string;
  supportsDynamicLegends: boolean;
  geometryType: string;
}

export interface ServiceInfo {
  currentVersion: number;
  cimVersion: string;
  fields: Field[];
  serviceDescription: string;
  mapName: string;
  description: string;
  copyrightText: string;
  supportsDynamicLayers: boolean;
  layers: ServiceInfoLayer[];
  tables: any[];
  spatialReference: SpatialReference;
  singleFusedMapCache: boolean;
  initialExtent: Extent;
  fullExtent: Extent;
  datesInUnknownTimezone: boolean;
  minScale: number;
  maxScale: number;
  units: string;
  supportedImageFormatTypes: string;
  documentInfo: DocumentInfo;
  capabilities: string;
  supportedQueryFormats: string;
  exportTilesAllowed: boolean;
  referenceScale: number;
  supportsDatumTransformation: boolean;
  archivingInfo: ArchivingInfo;
  supportsClipping: boolean;
  supportsSpatialFilter: boolean;
  supportsTimeRelation: boolean;
  supportsQueryDataElements: boolean;
  maxRecordCount: number;
  maxImageHeight: number;
  maxImageWidth: number;
  supportedExtensions: string;
  serviceItemId: string;
}
