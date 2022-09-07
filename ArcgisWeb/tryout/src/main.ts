import ArcGISMap from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import './style.css';
const map = new ArcGISMap({
  basemap: "streets-vector"
});

const view = new MapView({
  map: map,
  container: "viewDiv",
  center: [-118.244, 34.052],
  zoom: 12
});

view.when(() => {
  console.log("Map is loaded");
})
