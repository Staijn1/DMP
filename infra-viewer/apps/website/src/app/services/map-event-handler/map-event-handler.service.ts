import {Injectable} from '@angular/core';
import Collection from '@arcgis/core/core/Collection';
import Layer from '@arcgis/core/layers/Layer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import {QueryService} from '../query/query.service';
import SymbolProperties = __esri.SymbolProperties;

@Injectable({
  providedIn: 'root'
})
export class MapEventHandlerService {
  private queryResultLayer!: __esri.GraphicsLayer;

  constructor(private readonly queryService: QueryService) {
  }

  onViewClick(event: __esri.ViewClickEvent, view: __esri.SceneView) {
    // Determine if the user clicked on a feature
    view.hitTest(event).then((response) => {
      // The user did not click on a feature
      if (!response.results.length) {
        // If the user held ctrl, then we want to query the location
        if (event.native.ctrlKey) {
          this.queryService.queryOnLocation(event.mapPoint, view.map.layers as Collection<Layer>)
            .then(results => this.onQueryLocationResults(results, event.mapPoint, view));
        } else {
          // If not, then we want to clear the query results
          // Enable all the layers and remove the query results layer
          if (this.queryResultLayer) {
            view.map.layers.filter(layer => layer.type != 'scene').forEach((layer) => layer.visible = true);
            view.map.remove(this.queryResultLayer);
          }
        }
      }
    });
  }

  private onQueryLocationResults(results: __esri.FeatureSet[], locationClicked: __esri.Point, view: __esri.SceneView) {
    // Disable all the layers
    view.map.layers.filter(layer => layer.type != 'scene').forEach((layer) => layer.visible = false);
    if (!this.queryResultLayer) {
      this.queryResultLayer = new GraphicsLayer({
        title: 'Query results',
        listMode: 'show',
        id: 'queryResults',
      });
    }

    const graphics = [];
    for (const result of results) {
      for (const feature of result.features) {
        graphics.push(feature);
      }
    }

    // Add a graphic to the map at the location of the click
    const graphic = new Graphic({
      geometry: locationClicked,
      symbol: {
        type: 'point-3d',
        symbolLayers: [
          {
            type: 'icon',
            anchor: 'center',
            outline: {color: [0, 0, 0, 1], size: 1},
            material: {color: [255, 255, 255, 1]}
          }
        ],
        verticalOffset: {
          screenLength: 40,
          maxWorldLength: 200,
          minWorldLength: 35
        },
        callout: {
          type: 'line', // autocasts as new LineCallout3D()
          size: 0.5,
          color: [0, 0, 0]
        }
      } as SymbolProperties,
    });

    this.queryResultLayer.removeAll();
    this.queryResultLayer.add(graphic);
    this.queryResultLayer.addMany(graphics);
    this.queryResultLayer.visible = true;
    view.map.add(this.queryResultLayer);
  }
}
