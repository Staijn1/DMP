// Create a 3d scene with arcgis
import Map from '@arcgis/core/Map';
import SceneView from '@arcgis/core/views/SceneView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

const footprintBuildings = new FeatureLayer({
  url:
    'https://services2.arcgis.com/cFEFS0EWrhfDeVw9/arcgis/rest/services/san_francisco_footprints_selection/FeatureServer',
  renderer: {
    type: 'simple',
    symbol: {
      type: 'polygon-3d',
      symbolLayers: [
        {
          type: 'fill',
          material: {color: [255, 237, 204]},
          outline: {color: [133, 108, 62, 0.5]}
        }
      ]
    }
  } as any,
  visible: false
});

const extrudedBuildings = new FeatureLayer({
  url:
    'https://services2.arcgis.com/cFEFS0EWrhfDeVw9/arcgis/rest/services/san_francisco_footprints_selection/FeatureServer',
  renderer: {
    type: 'simple',
    symbol: {
      type: 'polygon-3d',
      symbolLayers: [
        {
          type: 'extrude',
          material: {color: [255, 237, 204]},
          edges: {
            type: 'solid',
            color: [133, 108, 62, 0.5],
            size: 1
          }
        }
      ]
    },
    visualVariables: [
      {
        type: 'size',
        field: 'heightcm',
        valueUnit: 'centimeters'
      }
    ]
  } as any,
  visible: true
});


// Create Map
var map = new Map({
  basemap: 'arcgis-light-gray',
  ground: 'world-elevation',
  layers: [footprintBuildings, extrudedBuildings]
});

// Create the SceneView
var view = new SceneView({
  container: 'viewDiv',
  map: map,
  camera: {
// @ts-ignore
    position: [-122.39899666, 37.77940678, 314.88439],
    heading: 356.82,
    tilt: 78.61
  },
  qualityProfile: 'high'
});
let type = 'cartographic';

/*

document.getElementById("footprint").addEventListener("click", function (event) {
  footprintBuildings.visible = true;
  extrudedBuildings.visible = false;
});
document.getElementById("extruded").addEventListener("click", function (event) {
  footprintBuildings.visible = false;
  extrudedBuildings.visible = true;
});*/
