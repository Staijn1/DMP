import {Injectable} from '@angular/core';
import Collection from '@arcgis/core/core/Collection';
import Layer from '@arcgis/core/layers/Layer';
import Graphic from '@arcgis/core/Graphic';
import {QueryService} from '../query/query.service';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import SceneView from '@arcgis/core/views/SceneView';
import Point from '@arcgis/core/geometry/Point';
import PointSymbol3D from '@arcgis/core/symbols/PointSymbol3D';

@Injectable({
  providedIn: 'root'
})
export class MapEventHandlerService {
  private queryResultGroupLayer!: GroupLayer;

  constructor(private readonly queryService: QueryService) {
  }

  /**
   * A query is performed and actively being shown if the group layer exists and it's visible
   * @returns {boolean}
   * @private
   */
  private get isQueryActive(): boolean {
    return this.queryResultGroupLayer && this.queryResultGroupLayer.visible;
  }

  onViewClick(event: __esri.ViewClickEvent, view: __esri.SceneView) {
    this.queryAllObjectsAroundLocation(view, event);
  }

  /**
   * Query all the objects around the location clicked
   * @param {__esri.SceneView} view
   * @param {__esri.ViewClickEvent} event
   * @private
   */
  private queryAllObjectsAroundLocation(view: __esri.SceneView, event: __esri.ViewClickEvent) {
    // Determine if the user clicked on a feature
    view.hitTest(event).then((response) => {
      // The user did not click on a feature
      if (!response.results.length) {
        // If the user held ctrl, then we want to query the location
        if (event.native.ctrlKey) {
          this.queryService.queryOnLocation(event.mapPoint, view.map.layers as Collection<Layer>)
            .then(results => this.displayFeaturesAroundLocation(results, event.mapPoint, view));
        } else {
          // If not, then we want to clear the query results
          // Enable all the layers and remove the query results layer
          if (this.isQueryActive) {
            view.map.layers.filter(layer => layer.type != 'scene').forEach((layer) => layer.visible = true);
            view.map.remove(this.queryResultGroupLayer);
          }
        }
      }
    });
  }

  /**
   * Display the features around the location
   * This function creates a new group layer and adds it to the map
   * This group layer contains graphics layers for each of the layers that were queried.
   * It copies the renderer from the original layer and applies it to the graphics layer containing the returned features
   * To make sure you only see the returned features, the original layers are hidden
   * @param {__esri.FeatureSet[]} results
   * @param {__esri.Point} locationClicked
   * @param {__esri.SceneView} view
   * @private
   */
  private displayFeaturesAroundLocation(results: { featureSet: FeatureSet; layer: FeatureLayer }[], locationClicked: Point, view: SceneView) {
    // If the query results group layer already exists, remove it
    if (this.isQueryActive) view.map.remove(this.queryResultGroupLayer);

    this.queryResultGroupLayer = new GroupLayer({
      title: 'Query results',
      listMode: 'show',
      id: 'queryResults',
    });

    const locationLayer = new GraphicsLayer({
      title: 'Location',
      listMode: 'show'
    });

    // Add a graphic to the map at the location of the click
    const clickedLocationMarker = new Graphic({
      geometry: locationClicked,
      symbol: new PointSymbol3D({
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
          type: 'line',
          size: 0.5,
          color: [0, 0, 0]
        }
      })
    });
    locationLayer.add(clickedLocationMarker)
    this.queryResultGroupLayer.add(locationLayer);
    // Disable all the layers
    view.map.layers.filter(layer => layer.type != 'scene').forEach((layer) => layer.visible = false);

    for (const result of results) {
      // Create a feature layer with the returned features
      const featureLayer = new FeatureLayer(
        {
          source: result.featureSet.features,
          title: result.layer.title,
          renderer: result.layer.renderer,
          objectIdField: result.layer.objectIdField,
          fields: result.layer.fields,
          elevationInfo: result.layer.elevationInfo,
        }
      );

      this.queryResultGroupLayer.add(featureLayer);
    }

    view.map.add(this.queryResultGroupLayer);
  }
}
