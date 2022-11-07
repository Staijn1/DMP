import {CustomFeatureLayer, QueriedFeatures} from '@infra-viewer/interfaces';

export abstract class Strategy {
  protected view: __esri.SceneView;

  public constructor(view: __esri.SceneView) {
    this.view = view;
  }

  abstract execute(event: __esri.FeatureLayerEditsEvent, editedFeatures: QueriedFeatures, affectedLayers: __esri.Collection<CustomFeatureLayer>): Promise<void>;
}
