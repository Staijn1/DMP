import { createFeatureLayerFromFeatureLayer } from "apps/website/src/app/utils/utils";
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import {CustomFeatureLayer, QueriedFeatures} from '@infra-viewer/interfaces';
import FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import {Strategy} from './Strategy';

/**
 * Strategy that is used to update the energy label layer when a tree is edited
 * When a tree is placed or moved, the energy label layer should be updated. When a tree is close to a building, the energy label increases
 * Energy labels go from A+++++ to G
 */
export class EnergyLabelStrategy extends Strategy{
  private static displayLayer: FeatureLayer | undefined;

  async execute(event: __esri.FeatureLayerEditsEvent, editedFeatures: QueriedFeatures, affectedLayers: __esri.Collection<CustomFeatureLayer>) {
    // If there are no affected layers, return
    if (!affectedLayers || affectedLayers.length == 0) return;
    // If there are no edits, return
    if (!event.addedFeatures && !event.updatedFeatures && !event.deletedFeatures) return;

    // Get the energy labels layer
    const energyLabelsLayer = affectedLayers.getItemAt(0) as CustomFeatureLayer;

    // Find the energy labels that are close to the trees that were edited
    const energyLabels = await this.findEnergyLabelsCloseToTrees(event, editedFeatures, energyLabelsLayer);
    // Update the energy labels
    await this.updateEnergyLabels(energyLabels, energyLabelsLayer);
  }

  /**
   * Find the energy labels that are close to the trees that were edited
   * Energy labels are considered close to a tree when the distance between the tree and the energy label is less than 20 meters
   */
  async findEnergyLabelsCloseToTrees(
    event: __esri.FeatureLayerEditsEvent,
    editedFeatures: QueriedFeatures,
    energyLabelsLayer: CustomFeatureLayer): Promise<FeatureSet> {
    // For each tree that was edited, find the energy labels that are close to it
    const energyLabels = new FeatureSet();
    const promises = [];
    for (const tree of editedFeatures.featureSet.features) {
      const query = energyLabelsLayer.createQuery();
      query.geometry = tree.geometry;
      query.outFields = ['*'];
      query.returnGeometry = true;
      query.distance = 20;
      query.units = 'meters';
      promises.push(energyLabelsLayer.queryFeatures(query));
    }
    const results = await Promise.all(promises);
    results.forEach((result) => {
      energyLabels.features = energyLabels.features.concat(result.features);
    });
    return energyLabels;
  }

  /**
   * Update the energy labels that are close to the trees that were edited.
   * If the layer does not support editing then make the changes in the client
   */
  async updateEnergyLabels(energyLabels: __esri.FeatureSet, energyLabelsLayer: CustomFeatureLayer) {
    // Update the energy labels
    energyLabels.features.forEach((energyLabel) => {
        // Increase the energy label by one
        energyLabel.attributes.Meest_voorkomende_label = 'A'
      }
    );

    // If the layer does not support editing, then update the graphics in the client. Do this by creating a client side feature layer
    if (!energyLabelsLayer.editingEnabled) {
      // If the display layer does not exist yet, create it
      if (!EnergyLabelStrategy.displayLayer) {
        EnergyLabelStrategy.displayLayer = createFeatureLayerFromFeatureLayer({
          featureSet: energyLabels,
          layer: energyLabelsLayer,
        });
        EnergyLabelStrategy.displayLayer.title = EnergyLabelStrategy.displayLayer.title + ' (aangepast)';
        this.view.map.add(EnergyLabelStrategy.displayLayer);
      } else {
        // If the display layer does exist, update it by appending the new graphics
        await EnergyLabelStrategy.displayLayer.applyEdits({addFeatures: energyLabels.features});
        EnergyLabelStrategy.displayLayer.refresh();
      }
    }
  }
}
