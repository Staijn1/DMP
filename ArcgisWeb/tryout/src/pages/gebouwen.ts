import WebScene from '@arcgis/core/WebScene';
import SceneView from '@arcgis/core/views/SceneView';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import SceneLayer from '@arcgis/core/layers/SceneLayer';
import esriConfig from '@arcgis/core/config.js';
import {apiKey} from '../vite-env';
import ElevationLayer from '@arcgis/core/layers/ElevationLayer';
import LayerList from '@arcgis/core/widgets/LayerList';
import Daylight from '@arcgis/core/widgets/Daylight';

esriConfig.apiKey = apiKey;


/*************************************************
 *                  Layers
 ************************************************/
const elevation = new ElevationLayer(
  {
    url: 'https://tiles.arcgis.com/tiles/nSZVuSZjHpEZZbRo/arcgis/rest/services/Elevation_3D_WGS/ImageServer',
    id: 'elevation'
  }
)

const buildings = new SceneLayer({
  url: 'https://tiles.arcgis.com/tiles/nSZVuSZjHpEZZbRo/arcgis/rest/services/BAG_3D_WGS/SceneServer',
  id: 'buildings',
  renderer: {
    type: 'simple',
    symbol: {
      type: 'mesh-3d',  // autocasts as new MeshSymbol3D()
      symbolLayers: [{
        type: 'fill',  // autocasts as new FillSymbol3DLayer()
        material: {color: '#afbcf8'}
      }]
    }
  } as any
})

const trees = new SceneLayer({
  id: 'trees',
  url: 'https://tiles.arcgis.com/tiles/nSZVuSZjHpEZZbRo/arcgis/rest/services/3D_Bomen_WGS/SceneServer',
})

const windTurbines = new SceneLayer({
  id: 'windTurbines',
  url: 'https://tiles.arcgis.com/tiles/nSZVuSZjHpEZZbRo/arcgis/rest/services/3D_Windturbines_WGS/SceneServer/',
})

const map = new WebScene({
  basemap: 'hybrid',
  layers: [buildings, trees, windTurbines],
} as any);

map.ground.layers.add(elevation);


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

    view.goTo({
      position: {
        latitude: 51.964370,
        longitude: 5.910011,
        z: 2500
      },
      tilt: 30,
      heading: 0
    }).then();

    const sketchVM = new SketchViewModel({
      view: view
    });

    sketchVM.on('create', function (event) {
      if (event.state === 'complete') {
        sketchVM.update(event.graphic);
      }
    });
  })
  .catch(console.error);

/*************************************************
 *                 UI
 ************************************************/

const layerList = new LayerList({
  view: view
})

view.ui.add(layerList, {
  position: 'top-right'
});

