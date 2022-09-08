import WebScene from '@arcgis/core/WebScene';
import SceneView from '@arcgis/core/views/SceneView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import SceneLayer from '@arcgis/core/layers/SceneLayer';
import esriConfig from '@arcgis/core/config.js';
import {apiKey} from '../vite-env';

// Notes:
// WMS Layer and integrate it with 3DBAG
// Convert 3DBAG to 3D Scene Layer? GLTF? https://github.com/Amsterdam/Netherlands3D/blob/main/PackageUserManual/Dutch/DataKlaarzetten.md

esriConfig.apiKey = apiKey;

const map = new WebScene({
  basemap: 'arcgis-imagery',
  ground: 'world-elevation'
});

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

/********************************************************************
 * Add layer containing street furniture features: benches, street lamps
 ********************************************************************/

// convenience function to retrieve the WebStyleSymbols based on their name
function getStreetSymbol(name: string) {
  return {
    type: 'web-style', // autocasts as new WebStyleSymbol()
    name: name,
    styleName: 'EsriRealisticStreetSceneStyle'
  };
}

// use a UniqueValueRenderer to symbolize the different feature types (street lamps, trash bin)
const streetFurnitureRenderer = {
  type: 'unique-value', // autocasts as new UniqueValueRenderer()
  field: 'CATEGORY',
  defaultSymbol: getStreetSymbol('Light_On_Post_-_Light_on'),
  uniqueValueInfos: [
    {
      value: 'Overhanging street',
      symbol: getStreetSymbol('Overhanging_Street_-_Light_on')
    },
    {
      value: 'Overhanging street and sidewalk',
      symbol: getStreetSymbol('Light_On_Post_-_Light_on')
    },
    {
      value: 'Trash bin',
      symbol: getStreetSymbol('Trash_Bin_1')
    },
    {
      value: 'Newspaper',
      symbol: getStreetSymbol('Newspaper_Vending_Machine')
    },
    {
      value: 'Park bench 1',
      symbol: getStreetSymbol('Park_Bench_2')
    }
  ],
  visualVariables: [
    {
      type: 'rotation',
      field: 'ROTATION'
    },
    {
      type: 'size',
      field: 'SIZE',
      axis: 'height'
    }
  ]
};


const buildings = new SceneLayer({
  url: 'https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/philadelphia_Bldgs_text_untex/SceneServer',
  elevationInfo: {
    mode: 'absolute-height',
    offset: -6
  }
})

map.add(buildings);

view.ui.add('extra', 'bottom-right');

const graphicsLayer = new GraphicsLayer({
  elevationInfo: {mode: 'on-the-ground'}
});
view.map.add(graphicsLayer);

const treeBtn = document.getElementById('tree');
const busBtn = document.getElementById('bus');




view
  .when(function () {
    // This sample uses the SketchViewModel to add points to a
    // GraphicsLayer. The points have 3D glTF models as symbols.
    const sketchVM = new SketchViewModel({
      layer: graphicsLayer,
      view: view
    });
    sketchVM.pointSymbol = {
      type: "point-3d",
      symbolLayers: [
        {
          type: "object",
          resource: {
            href: "https://developers.arcgis.com/javascript/latest/sample-code/import-gltf/live/tent.glb"
          }
        }
      ]
    } as any;
    treeBtn?.addEventListener('click', function () {
      // reference the relative path to the glTF model
      // in the resource of an ObjectSymbol3DLayer

      sketchVM.create('point');
      this.classList.add('esri-button--secondary');
    });

    busBtn?.addEventListener('click', function () {
      // reference the relative path to the glTF model
      // in the resource of an ObjectSymbol3DLayer
      sketchVM.pointSymbol = {
        type: 'point-3d',
        symbolLayers: [
          {
            type: 'object',
            resource: {
              href:
                'https://static.arcgis.com/arcgis/styleItems/RealisticTransportation/web/resource/Bus.json'
            }
          }
        ]
      } as any;
      sketchVM.create('point');
      this.classList.add('esri-button--secondary');
    });

    sketchVM.on('create', function (event) {
      if (event.state === 'complete') {
        sketchVM.update(event.graphic);
      }
    });
  })
  .catch(console.error);
