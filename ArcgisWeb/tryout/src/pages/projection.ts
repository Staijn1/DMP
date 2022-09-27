import WebScene from '@arcgis/core/WebScene';
import SceneView from '@arcgis/core/views/SceneView';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import SceneLayer from '@arcgis/core/layers/SceneLayer';
import esriConfig from '@arcgis/core/config.js';
import {apiKey} from '../vite-env';
import ElevationLayer from '@arcgis/core/layers/ElevationLayer';
import LayerList from '@arcgis/core/widgets/LayerList';
import Search from '@arcgis/core/widgets/Search';
import Expand from '@arcgis/core/widgets/Expand';
import ElevationProfile from '@arcgis/core/widgets/ElevationProfile';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import WebStyleSymbol from '@arcgis/core/symbols/WebStyleSymbol';
import RendererProperties = __esri.RendererProperties;
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Basemap from '@arcgis/core/Basemap';
import TileLayer from '@arcgis/core/layers/TileLayer';

esriConfig.apiKey = apiKey;
const buildings = new SceneLayer({
  url: 'https://tiles.arcgis.com/tiles/nSZVuSZjHpEZZbRo/arcgis/rest/services/BAG_3D_RD/SceneServer',
  id: 'buildings',
  featureReduction: {type: 'selection'},
})

const banken = new GeoJSONLayer({
  url: 'https://geo.arnhem.nl/arcgis/rest/services/OpenData/Banken/MapServer/0/query?outFields=*&where=1%3D1&f=geojson',
  title: 'Banken'
})

const map = new WebScene({
  basemap: new Basemap({
    baseLayers: [
      new TileLayer({
        url: 'https://services.arcgisonline.nl/arcgis/rest/services/Basiskaarten/Topo/MapServer',
      })
    ]
  }),
  layers: [banken, buildings]
} as any);


/*************************************************
 *                  View
 ************************************************/
// Create the view
const view = new SceneView({
  container: 'viewDiv',
  map: map,
  environment: {
    lighting: {
      date: new Date(),
      directShadowsEnabled: true
    },
    atmosphere: {
      quality: 'low'
    }
  }
});


view
  .when(function () {

    /*view.goTo({
      position: {
        latitude: 51.964370,
        longitude: 5.910011,
        z: 2500
      },
      tilt: 30,
      heading: 0
    }).then();*/
  })
  .catch(console.error);
