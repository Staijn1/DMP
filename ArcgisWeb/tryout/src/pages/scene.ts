// Create a 3d scene with arcgis
import Map from '@arcgis/core/Map';
import SceneView from '@arcgis/core/views/SceneView';

const map = new Map({
  basemap: 'topo-vector',
  ground: {
    // @ts-ignore
    type: 'world-elevation',
    opacity: 0.5,
  }
});

const scene = new SceneView({
  map: map,
  camera: {
    position: {
      x: 5.8987,
      y: 51.9851,
      z: 15000 // altitude in meters
    },
    tilt: 0,
    heading: 359.73
  },
  container: 'viewDiv',
  viewingMode: 'global',
  environment: {
    atmosphereEnabled: true,
    starsEnabled: false,
    lighting: {
      directShadowsEnabled: true,
    }
  }
});
