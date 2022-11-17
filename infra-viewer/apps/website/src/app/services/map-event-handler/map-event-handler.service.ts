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
import {CustomFeatureLayer, QueriedFeatures} from '@infra-viewer/interfaces';
import FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import {createFeatureLayerFromFeatureLayer} from '../../utils/utils';
import {Strategy} from '../../shared/components/arcgis-map/strategies/Strategy';
import {RuleStrategy} from '../../shared/components/arcgis-map/strategies/300RuleStrategy';
import ViewClickEvent = __esri.ViewClickEvent;
import {EnergyLabelStrategy} from '../../shared/components/arcgis-map/strategies/EnergyLabelStrategy';

@Injectable({
  providedIn: 'root'
})
export class MapEventHandlerService {
  private queryResultGroupLayer!: GroupLayer;

  registerEvents(view: __esri.SceneView) {
    // Find layers starting with id editable and add the edits event
    view.map.layers
      .filter(layer => layer.id.startsWith('editable'))
      .forEach((layer) => {
        if (layer instanceof FeatureLayer) {
          layer.on('edits', (event) => this.onLayerEdited(event, view, layer));
        }
      });
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
    // todo it should affect the layerviews in the sketch query widget
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

  /**
   * Fired when a user edits something in an editable layer.
   * If the layer edited has a "affects" property, then these layers should be edited as well with a certain strategy
   * This strategy depends on the layer that is affected.
   * For example when a tree is edited/added, the distance to tree layer should be updated
   * For now we update the energylabels layer as a placeholder
   * @param {__esri.EditsEvent} event - The event that contains the edits
   * @param {__esri.SceneView} view - The view that contains the layers
   * @param {__esri.FeatureLayer} editedLayer - The layer that was edited
   */
  onLayerEdited(event: __esri.FeatureLayerEditsEvent, view: __esri.SceneView, editedLayer: CustomFeatureLayer) {
    const strategyMap = new Map<string, Strategy>([
      ['300Rule', new RuleStrategy(view)],
      ['energielabels', new EnergyLabelStrategy(view)]
    ]);

    if (!editedLayer.affects) return;
    // First, find if there are any layers that are affected by the edits
    const affectedLayers = view.map.layers
      .filter(layer => layer instanceof FeatureLayer)
      .filter(layer => editedLayer.affects?.map(a => a.id).includes(layer.id) as boolean) as Collection<CustomFeatureLayer>;

    // Query the graphics that were edited
    const query = editedLayer.createQuery();
    query.objectIds = event.addedFeatures.map(feature => feature.objectId);
    query.objectIds = query.objectIds.concat(event.updatedFeatures.map(feature => feature.objectId));
    // todo what to do with deleted features?

    editedLayer.queryFeatures(query).then((editedFeatures) => {
      const promises = [];
      for (const affectedLayer of affectedLayers) {
        // The edited layer contains an array of layers that it affects, with a strategy for each
        const strategy = strategyMap.get(editedLayer.affects?.find(a => a.id == affectedLayer.id)?.strategy as string);
        if (strategy) {
          promises.push(strategy.execute(event, {featureSet: editedFeatures, layer: editedLayer}, affectedLayer));
        }
        affectedLayer.visible = false;
      }
      return Promise.all(promises);
    }).then(() => console.log("Executed strategies"));
  }
}
