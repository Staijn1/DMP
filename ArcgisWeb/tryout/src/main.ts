import ArcGISMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Track from '@arcgis/core/widgets/Track';
import Graphic from '@arcgis/core/Graphic';

const map = new ArcGISMap({
  basemap: 'streets-vector'
});

const view = new MapView({
  map: map,
  container: 'viewDiv',
  center: [4.9041,52.3676],
  zoom: 12
});

const track = new Track({
  view: view,
  useHeadingEnabled: true,
  goToOverride: function (view, options) {
    options.target.scale = 1500;  // Override the default map scale
    return view.goTo(options.target);
  }
})

view.ui.add(track, 'top-left');

view.when(() => {
  console.log('Map is loaded');
})
