import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {LayerConfig, ServiceInfo, ServiceInfoLayer, SystemConfiguration} from '@infra-viewer/interfaces';
import UniqueValueInfo from '@arcgis/core/renderers/support/UniqueValueInfo';
import PointSymbol3D from '@arcgis/core/symbols/PointSymbol3D';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer';
import UIkit from 'uikit';
import LayerProperties = __esri.LayerProperties;
import {getTypeForHubItem} from '../../../utils/utils';

@Component({
  selector: 'app-layer-editor',
  templateUrl: './layer-editor.component.html',
  styleUrls: ['./layer-editor.component.scss'],
})
export class LayerEditorComponent {
  @ViewChild('modal') modal!: ElementRef<HTMLDivElement>
  @Output() save: EventEmitter<LayerProperties> = new EventEmitter<LayerProperties>();
  @Input() rootLayerConfig!: LayerConfig | undefined;
  @Input() configuration!: SystemConfiguration;
  UniqueValueRenderer = UniqueValueRenderer;
  serviceInfo!: ServiceInfo;
  selectedSublayerIndex = 0;
  selectedLayer: LayerConfig | undefined;

  get isMapImageLayer() {
    return this.selectedLayer?.type === 'map-image';
  }

  /**
   * Create a new renderer, by default it will be a unique value renderer
   */
  createRenderer() {
    if (!this.rootLayerConfig || this.rootLayerConfig.type === 'map-image') return;
    this.rootLayerConfig.renderer = new UniqueValueRenderer();
  }

  /**
   * Create a default entry for unique value renderer
   */
  addUniqueValue() {
    if (!this.rootLayerConfig || this.rootLayerConfig.type === 'map-image') return;
    if (!this.rootLayerConfig.renderer) return;
    (this.rootLayerConfig.renderer as UniqueValueRenderer).uniqueValueInfos.push(new UniqueValueInfo({
      value: '',
      symbol: new PointSymbol3D({
        verticalOffset: {
          screenLength: undefined,
          maxWorldLength: undefined,
          minWorldLength: undefined
        },
        symbolLayers: [
          {
            type: 'icon',
            material: {
              color: '#ff0000'
            },
            outline: {
              color: '#ff0000',
              size: 1
            },
          }
        ]
      })
    }));
  }

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
    if (this.rootLayerConfig.type !== 'map-image' && this.rootLayerConfig.popupEnabled === undefined) this.rootLayerConfig.popupEnabled = true;

    this.selectedLayer = this.serviceInfo.layers ? this.createDefaultConfig(this.serviceInfo.layers[0]) : selectedLayer;
    UIkit.modal(this.modal.nativeElement).show();
  }

  /**
   * Close the modal
   */
  close() {
    UIkit.modal(this.modal.nativeElement).hide();
  }

  selectSublayer(i: number) {
    const sublayer = this.serviceInfo.layers[i];
    if (!(this.rootLayerConfig as any).sublayers && this.rootLayerConfig?.type === 'map-image') {
      (this.rootLayerConfig as any).sublayers = [this.selectedLayer];
    }
    this.selectedLayer = this.createDefaultConfig(sublayer);
  }

  private createDefaultConfig(serviceInfoLayer: ServiceInfoLayer): LayerConfig {
    return {
      type: getTypeForHubItem(serviceInfoLayer),
      elevationInfo: {
        mode: 'on-the-ground',
        unit: 'meters',
        offset: 0,
      }
    } as LayerConfig
  }
}
