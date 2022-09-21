// import SceneLayerProperties from '@arcgis/core/interfaces';

export type SystemConfiguration = {
  scenelayers: any[];
  featurelayers: any[];
  elevationLayer: { url: string } & any;
  basemap: string;
};
