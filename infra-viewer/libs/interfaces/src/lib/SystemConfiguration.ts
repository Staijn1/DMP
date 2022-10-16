// import SceneLayerProperties from '@arcgis/core/interfaces';

export type SystemConfiguration = {
  scenelayers: any[];
  featurelayers: any[];
  elevationLayer: { url: string } & any;
  geoJSONLayers: any[];
};

export type SystemConfigurationLayerTypes =
  'scenelayers'
  | 'featurelayers'
  | 'geoJSONLayers'
