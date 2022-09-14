import WebScene from '@arcgis/core/WebScene';
import SceneView from '@arcgis/core/views/SceneView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import SceneLayer from '@arcgis/core/layers/SceneLayer';
import esriConfig from '@arcgis/core/config.js';
import {apiKey} from '../vite-env';
import WebTileLayer from '@arcgis/core/layers/WebTileLayer';
import Basemap from '@arcgis/core/Basemap';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';

// Notes:
// WMS Layer and integrate it with 3DBAG
// Convert 3DBAG to 3D Scene Layer? GLTF? https://github.com/Amsterdam/Netherlands3D/blob/main/PackageUserManual/Dutch/DataKlaarzetten.md

esriConfig.apiKey = apiKey;

const vtlLayer = new VectorTileLayer({
  url: "https://tiles.arcgis.com/tiles/nSZVuSZjHpEZZbRo/arcgis/rest/services/Topo_RD/VectorTileServer/"
});

const map = new WebScene({
  ground: 'world-elevation',
  layers: [vtlLayer],
  spatialReference: {
    wkid: 28992
  }
} as any);

// Create the view
const view = new SceneView({
  container: 'viewDiv',
  map: map,
  camera: {
    position: {
      latitude: 52.377956,
      longitude: 4.897070,
      z: 5000
    },
    tilt: 0,
    heading: 0
  },
  environment: {
    lighting: {
      date: new Date('June 15, 2015 16:00:00 CET'),
      directShadowsEnabled: true,
      ambientOcclusionEnabled: true
    }
  }
});


const buildings = new SceneLayer({
  url: 'https://tiles.arcgis.com/tiles/nSZVuSZjHpEZZbRo/arcgis/rest/services/3D_Basisbestand_Gebouwen/SceneServer',
  spatialReference: {
    wkid: 28992
  },
  elevationInfo: {
    mode: 'absolute-height',
    offset: -6
  }
})

map.add(buildings);


view
  .when(function () {
    // This sample uses the SketchViewModel to add points to a
    // GraphicsLayer. The points have 3D glTF models as symbols.
    const sketchVM = new SketchViewModel({
      view: view
    });
    sketchVM.pointSymbol = {
      type: 'point-3d',
      symbolLayers: [
        {
          type: 'object',
          resource: {
            href: 'https://developers.arcgis.com/javascript/latest/sample-code/import-gltf/live/tent.glb'
          }
        }
      ]
    } as any;

    sketchVM.on('create', function (event) {
      if (event.state === 'complete') {
        sketchVM.update(event.graphic);
      }
    });
  })
  .catch(console.error);
