import {Injectable} from '@angular/core';
import Collection from '@arcgis/core/core/Collection';
import Layer from '@arcgis/core/layers/Layer';
import Graphic from '@arcgis/core/Graphic';
import {QueryService} from '../query/query.service';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import SceneView from '@arcgis/core/views/SceneView';
import Point from '@arcgis/core/geometry/Point';
import PointSymbol3D from '@arcgis/core/symbols/PointSymbol3D';
import {MapUIBuilderService} from '../map-uibuilder/map-uibuilder.service';
import {BehaviorSubject} from 'rxjs';
import {QueriedFeatures} from '@infra-viewer/interfaces';
import ViewClickEvent = __esri.ViewClickEvent;
import FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import {createFeatureLayerFromFeatureLayer} from '../../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class MapEventHandlerService {
  private queryResultGroupLayer!: GroupLayer;
  private queriedFeatures = new BehaviorSubject<QueriedFeatures[] | null>(null);
  queredFeatures$ = this.queriedFeatures.asObservable();

  constructor(
    private readonly queryService: QueryService,
    private readonly uiBuilder: MapUIBuilderService) {
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
            .then(results => {
              this.displayFeaturesAroundLocation(results, event.mapPoint, view)
              this.queriedFeatures.next(results)
            });
        } else {
          // If not, then we want to clear the query results
          // Enable all the layers and remove the query results layer
          if (this.isQueryActive) {
            this.queryResultGroupLayer.visible = false;
            this.queriedFeatures.next(null)
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
  private displayFeaturesAroundLocation(results: QueriedFeatures[], locationClicked: Point, view: SceneView) {
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
      const featureLayer = createFeatureLayerFromFeatureLayer(result);
      this.queryResultGroupLayer.add(featureLayer);
    }

    // Add the query results to the legend
    // Remove it if it already exists
    this.uiBuilder.legend.layerInfos.push({layer: this.queryResultGroupLayer, title: 'Query results'});
    view.map.add(this.queryResultGroupLayer);
  }


  registerEvents(view: __esri.SceneView) {
    view.on('immediate-click' as any, (event: ViewClickEvent) => this.onViewClick(event, view));
  }

  /**
   * This function is called when the filtering changes in the grids that show up after using the location query
   * The parameters contain the graphics that matched the filters and the layer that they belong to
   * In the corrosponding graphics layer, the graphics that did not match should be hidden and the ones that did should be shown
   * @param {__esri.Graphic[]} $event
   * @param {__esri.Layer} layer
   * @param view
   */
  onFilterChange($event: __esri.Graphic[], layer: __esri.Layer, view: __esri.SceneView) {
    const generatedFeatureLayer = this.queryResultGroupLayer.layers.find((graphicsLayer) => graphicsLayer.title == layer.title) as FeatureLayer;
    this.queryResultGroupLayer.remove(generatedFeatureLayer);
    view.map.remove(this.queryResultGroupLayer);
    const featureSet = new FeatureSet();
    featureSet.features = $event;
    const newFeatureLayer = createFeatureLayerFromFeatureLayer({featureSet: featureSet, layer: layer as FeatureLayer})
    // Replace the source of the feature layer with the filtered features
    this.queryResultGroupLayer.add(newFeatureLayer);

    view.map.add(this.queryResultGroupLayer);
  }
}
