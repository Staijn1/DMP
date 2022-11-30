import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {LayerConfig, ServiceInfo, ServiceInfoLayer, SystemConfiguration} from '@infra-viewer/interfaces';
import PointSymbol3D from '@arcgis/core/symbols/PointSymbol3D';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer';
import UIkit from 'uikit';
import {getTypeForHubItem} from '../../../utils/utils';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';

@Component({
  selector: 'app-layer-editor',
  templateUrl: './layer-editor.component.html',
  styleUrls: ['./layer-editor.component.scss'],
})
export class LayerEditorComponent {
  @ViewChild('modal') modal!: ElementRef<HTMLDivElement>
  @Output() save: EventEmitter<LayerConfig> = new EventEmitter<LayerConfig>();
  @Input() rootLayerConfig!: LayerConfig | undefined;
  @Input() configuration!: SystemConfiguration;
  UniqueValueRenderer = UniqueValueRenderer;
  serviceInfo!: ServiceInfo;
  selectedSublayerIndex = 0;
  selectedLayer: LayerConfig | undefined;

  /**
   * Emit the save event when the user wants to save
   */
  onLayerSave() {
    this.save.emit(this.rootLayerConfig);
  }

  /**
   * When the user clicks on cancel, we need to restore the original configuration
   */
  cancelEdit() {
    this.close();
  }

  /**
   * Start editing by opening the modal and setting some default values if they are not set
   */
  startEditing(selectedLayer: LayerConfig, serviceInfo: ServiceInfo) {
    this.rootLayerConfig = selectedLayer;
    // Insert the selected layer config in the first position of the layers array in the service info
    this.serviceInfo = serviceInfo;
    if (!this.rootLayerConfig) return;

    if (this.rootLayerConfig.legendEnabled === undefined) this.rootLayerConfig.legendEnabled = true;
    if (this.rootLayerConfig.type === 'map-image') {
      if (!this.rootLayerConfig.sublayers) this.rootLayerConfig.sublayers = [];
    } else {
      if (this.rootLayerConfig.popupEnabled === undefined) this.rootLayerConfig.popupEnabled = true;
    }
    this.selectedLayer = this.serviceInfo.layers.length > 1 ? this.createDefaultConfig(this.serviceInfo.layers[0]) : selectedLayer;
    UIkit.modal(this.modal.nativeElement).show();
  }

  /**
   * Close the modal
   */
  close() {
    UIkit.modal(this.modal.nativeElement).hide();
  }

  /**
   * When selecting a new sublayer, we need to save the old selected layer.
   *
   * Then we change the selected layer to the new selected layer
   * If this new selected layer does not exist in the sublayers array, we create a new default config for it
   * This function is only called for map-image layers, because the sublayer selection only shows up for map-image layers
   * @param serviceInfoLayer
   */
  selectSublayer(serviceInfoLayer: ServiceInfoLayer) {
    // Make the compiler aware that only map-image layers come through this function
    if (this.rootLayerConfig?.type !== 'map-image') return;

    this.saveSublayer();
    // Select the new selected layer
    // This is either the layer that is already in the sublayers array in the root config.
    // Or it is a new layer that we create with the default config
    const existingSublayerConfig = (this.rootLayerConfig?.sublayers as LayerConfig[]).find(sublayer => sublayer.id === serviceInfoLayer.id);

    if (existingSublayerConfig) {
      this.selectedLayer = existingSublayerConfig;
    } else {
      this.selectedLayer = this.createDefaultConfig(serviceInfoLayer);
    }
  }

  /**
   * Save the current selected layer. If the root layer config is a map-image layer, save the configuration in the sublayers array
   * If the root layer config is a feature layer, the configuration is already saved because of the ngModel bindings
   * @private
   */
  private saveSublayer() {
    if (this.rootLayerConfig?.type !== 'map-image' || !this.selectedLayer) return;
    if (!this.rootLayerConfig.sublayers) this.rootLayerConfig.sublayers = [];

    // Save the old selected layer
    const oldSelectedLayerIndex = (this.rootLayerConfig.sublayers as []).findIndex((l: LayerConfig) => l.id === this.selectedLayer?.id);
    if (oldSelectedLayerIndex !== -1) {
      (this.rootLayerConfig.sublayers as LayerConfig[])[oldSelectedLayerIndex] = this.selectedLayer;
    } else {
      (this.rootLayerConfig.sublayers as LayerConfig[]).push(this.selectedLayer);
    }
  }

  private createDefaultConfig(serviceInfoLayer: ServiceInfoLayer): LayerConfig {
    return {
      type: getTypeForHubItem(serviceInfoLayer),
      id: serviceInfoLayer.id,
      elevationInfo: {
        mode: 'on-the-ground',
        unit: 'meters',
        offset: 0,
      }
    } as LayerConfig
  }

  /**
   * When the user clicks on the "use this renderer" button, we create a new renderer for the selected layer if it does not exist yet
   * @param {Event} $event
   * @param {string} rendererType
   */
  onRendererChange($event: Event, rendererType: string) {
    if (this.selectedLayer?.type === 'feature') {
      if (rendererType === 'unique-value') {
        if (!this.selectedLayer?.renderer) {
          this.selectedLayer.renderer = new UniqueValueRenderer({
            field: 'OBJECTID',
            uniqueValueInfos: [],
          });
        }
      } else if (rendererType === 'simple') {
        if (!this.selectedLayer?.renderer) {
          this.selectedLayer.renderer = new SimpleRenderer({
            symbol: new PointSymbol3D(),
          });
        }
      }
    }
  }
}
