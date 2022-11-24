import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {LayerConfig, SystemConfiguration} from '@infra-viewer/interfaces';
import UniqueValueInfo from '@arcgis/core/renderers/support/UniqueValueInfo';
import PointSymbol3D from '@arcgis/core/symbols/PointSymbol3D';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer';
import UIkit from 'uikit';
import LayerProperties = __esri.LayerProperties;
import {LayerFactoryService} from '../../../services/layer-factory/layer-factory.service';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

@Component({
  selector: 'app-layer-editor',
  templateUrl: './layer-editor.component.html',
  styleUrls: ['./layer-editor.component.scss'],
})
export class LayerEditorComponent {
  @ViewChild('modal') modal!: ElementRef<HTMLDivElement>
  @Output() save: EventEmitter<LayerProperties> = new EventEmitter<LayerProperties>();
  @Input() layer!: LayerConfig | undefined;
  @Input() configuration!: SystemConfiguration;
  UniqueValueRenderer = UniqueValueRenderer;


  /**
   * Add elevation info to the layer
   */
  addElevationInfo() {
    if (!this.layer) return;
    this.layer.elevationInfo = {
      mode: 'on-the-ground',
      unit: 'meters',
      offset: 0,
    };
  }

  /**
   * Create a new renderer, by default it will be a unique value renderer
   */
  createRenderer() {
    if (!this.layer) return;
    this.layer.renderer = new UniqueValueRenderer();
  }

  /**
   * Create a default entry for unique value renderer
   */
  addUniqueValue() {
    if (!this.layer) return;
    if (!this.layer.renderer) return;
    (this.layer.renderer as UniqueValueRenderer).uniqueValueInfos.push(new UniqueValueInfo({
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
    this.save.emit(this.layer);
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
  startEditing(selectedLayer: LayerConfig) {
    this.layer = selectedLayer;
    if (!this.layer) return;
    if (this.layer.legendEnabled === undefined) this.layer.legendEnabled = true;
    if (!this.layer.elevationInfo) this.addElevationInfo();
    UIkit.modal(this.modal.nativeElement).show();
  }

  /**
   * Close the modal
   */
  close() {
    UIkit.modal(this.modal.nativeElement).hide();
  }
}
