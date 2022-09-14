import WebScene from '@arcgis/core/WebScene';
import SceneView from '@arcgis/core/views/SceneView';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import SceneLayer from '@arcgis/core/layers/SceneLayer';
import esriConfig from '@arcgis/core/config.js';
import {apiKey} from '../vite-env';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import ElevationLayer from '@arcgis/core/layers/ElevationLayer';

esriConfig.apiKey = apiKey;

const elevation = new ElevationLayer(
  {url: 'https://tiles.arcgis.com/tiles/nSZVuSZjHpEZZbRo/arcgis/rest/services/Elevation_3D_WGS/ImageServer'}
)

const buildings = new SceneLayer({
  url: 'https://tiles.arcgis.com/tiles/nSZVuSZjHpEZZbRo/arcgis/rest/services/BAG_3D_WGS/SceneServer',
  elevationInfo: {
    mode: 'absolute-height',
    offset: -6
  }
})

const map = new WebScene({
  basemap: 'satellite',
} as any);

map.ground.layers.add(elevation);


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
