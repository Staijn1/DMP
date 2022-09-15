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
  featureReduction: {type: 'selection'},
})

const windTurbines = new SceneLayer({
  id: 'windTurbines',
  url: 'https://tiles.arcgis.com/tiles/nSZVuSZjHpEZZbRo/arcgis/rest/services/3D_Windturbines_WGS/SceneServer/',
})

const speeltoestellen = new GeoJSONLayer({
  id: 'speeltoestellen',
  url: 'https://geo.arnhem.nl/arcgis/rest/services/OpenData/Spelenkaart/MapServer/1/query?outFields=*&where=1%3D1&f=geojson',
  title: 'Speeltoestellen',
})

const trafficSigns = new FeatureLayer({
  id: 'trafficSigns',
  url: 'https://services.arcgis.com/nSZVuSZjHpEZZbRo/arcgis/rest/services/Verkeersborden_NDW/FeatureServer/0',
});

const water = new FeatureLayer({
  id: 'water',
  url: 'https://basisregistraties.arcgisonline.nl/arcgis/rest/services/BRT/BRT_TOP10NL/FeatureServer/120/',
  renderer: {
    type: "simple",
    symbol: {
      type: "polygon-3d",
      symbolLayers: [{
        type: "water",
        waveDirection: 180,
        color: "#5975a3",
        waveStrength: "moderate",
        waterbodySize: "medium"
      }]
    }
  } as RendererProperties
})

const banken = new GeoJSONLayer({
  url: 'https://geo.arnhem.nl/arcgis/rest/services/OpenData/Banken/MapServer/0/query?outFields=*&where=1%3D1&f=geojson',
  title: 'Banken',
  renderer: {
    type: 'simple',
    symbol: new WebStyleSymbol({
      name: 'Park_Bench_2',
      styleName: 'EsriRealisticStreetSceneStyle'
    })
  } as RendererProperties
})

const trolleymasten = new GeoJSONLayer({
  url: 'https://geo.arnhem.nl/arcgis/rest/services/OpenData/Trolleymasten/MapServer/0/query?outFields=*&where=1%3D1&f=geojson',
  title: 'Trolleymasten',
  renderer: {
    type: 'simple',
    symbol: new WebStyleSymbol({
      // Todo make this a proper trolley pole
      name: 'Overhanging_Street_and_Sidewalk_-_Light_on',
      styleName: 'EsriRealisticStreetSceneStyle'
    })
  } as RendererProperties
})

const afvalbakken = new GeoJSONLayer({
  url: 'https://geo.arnhem.nl/arcgis/rest/services/OpenData/Afvalbakken/MapServer/0/query?outFields=*&where=1%3D1&f=geojson',
  id: 'afvalbakken',
  title: 'Afvalbakken',
  renderer: {
    type: 'simple',
    symbol: new WebStyleSymbol({
      name: 'Trash_Bin_2',
      styleName: 'EsriRealisticStreetSceneStyle'
    })
  } as RendererProperties
})

const map = new WebScene({
  basemap: 'hybrid',
  layers: [buildings, trees, windTurbines, banken, afvalbakken, speeltoestellen, trolleymasten, trafficSigns, water]
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

const searchWidget = new Search({
  view: view,
  container: document.createElement('div'),
});


const layerList = new LayerList({
  view: view
})

const layerlistExpand = new Expand({
  view: view,
  content: layerList,
})
const elevationProfile = new ElevationProfile({
  view: view,
  profiles: [{
    type: 'ground' // first profile line samples the ground elevation
  }, {
    type: 'view' // second profile line samples the view and shows building profiles
  }],
  // hide the select button
  // this button can be displayed when there are polylines in the
  // scene to select and display the elevation profile for
  visibleElements: {
    selectButton: false
  }
});
const elevationProfileExpand = new Expand({
  view: view,
  content: elevationProfile
});

view.ui.add(elevationProfileExpand, 'top-left');
view.ui.add(layerlistExpand, {
  position: 'top-left'
});

view.ui.add(searchWidget, {
  position: 'top-right'
});
