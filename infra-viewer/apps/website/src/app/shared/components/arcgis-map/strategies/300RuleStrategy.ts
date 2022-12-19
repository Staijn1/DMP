import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { CustomFeatureLayer, QueriedFeatures } from "@infra-viewer/interfaces";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet";
import { Strategy } from "./Strategy";
import { createFeatureLayerFromFeatureLayer } from "../../../../utils/utils";
import Collection from "@arcgis/core/core/Collection";
import PolygonSymbol3D from "@arcgis/core/symbols/PolygonSymbol3D";

/**
 * Strategy that is used to update the 3-30-300 policy map
 * The calculation for the scores is unknown for now, so the scores are hardcoded to 10
 */
export class RuleStrategy extends Strategy {
  private static displayLayer: FeatureLayer | undefined;

  async execute(event: __esri.FeatureLayerEditsEvent, editedFeatures: QueriedFeatures, affectedLayer: CustomFeatureLayer): Promise<void> {
    // If there are no affected layer, return
    if (!affectedLayer) return;
    // If there are no edits, return
    if (!event.addedFeatures && !event.updatedFeatures && !event.deletedFeatures) return;

    const geometries = await this.findGeometriesNearTrees(event, editedFeatures, affectedLayer);
    await this.updateScores(geometries, affectedLayer);
  }

  private async updateScores(featuresToEdit: __esri.FeatureSet, affectedLayer: CustomFeatureLayer) {
    // Update all the features that are close to the trees that were edited, with a score of 10
    featuresToEdit.features.forEach((feature) => {
      feature.attributes.TOTAAL_SCORE = 10;
    });

    // If the layer does not support editing, then update the graphics in the client. Do this by creating a client side feature layer
    if (!affectedLayer.editingEnabled) {
      // If the display layer does not exist yet, create it
      if (!RuleStrategy.displayLayer) {
        RuleStrategy.displayLayer = createFeatureLayerFromFeatureLayer({
          featureSet: featuresToEdit,
          layer: affectedLayer
        });
        const col = new Collection();
        col.addMany(featuresToEdit.features);
        RuleStrategy.displayLayer.source = col;
        RuleStrategy.displayLayer.title = RuleStrategy.displayLayer.title + " (aangepast)";
        this.view.map.add(RuleStrategy.displayLayer);
      } else {
        // If the display layer does exist, update it by appending the new graphics
        await RuleStrategy.displayLayer.applyEdits({ addFeatures: featuresToEdit.features });
      }
    }
  }

  /**
   * Find features around the trees that were edited in the layer that is affected by the strategy
   * Search in a radius of 20 meters
   * @param {__esri.FeatureLayerEditsEvent} event
   * @param {QueriedFeatures} editedFeatures
   * @param {CustomFeatureLayer} affectedLayer
   * @returns {Promise<__esri.FeatureSet | __esri.FeatureSet>}
   * @private
   */
  private async findGeometriesNearTrees(event: __esri.FeatureLayerEditsEvent,
                                        editedFeatures: QueriedFeatures,
                                        affectedLayer: CustomFeatureLayer) {
    // For each tree that was edited, find the features that are close to it
    const features = new FeatureSet();
    const promises = [];
    for (const tree of editedFeatures.featureSet.features) {
      const query = affectedLayer.createQuery();
      query.geometry = tree.geometry;
      query.outFields = ["*"];
      query.returnGeometry = true;
      query.distance = 20;
      query.units = "meters";
      promises.push(affectedLayer.queryFeatures(query));
    }
    const results = await Promise.all(promises);
    results.forEach((result) => {
      // If the features in the result do not have a symbol, add a default symbol
      result.features.forEach((feature) => {
        if (!feature.symbol) {
          feature.symbol = new PolygonSymbol3D({
            symbolLayers: [{
              type: "fill",  // autocasts as new FillSymbol3DLayer()
              material: { color: "red" }
            }]
          });
        }
      });
      features.features = features.features.concat(result.features);
    });
    return features;
  }
}
