import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SystemConfiguration} from '@infra-viewer/interfaces';
import LayerProperties = __esri.LayerProperties;
import FeatureLayerProperties = __esri.FeatureLayerProperties;
import UniqueValueInfo from '@arcgis/core/renderers/support/UniqueValueInfo';
import PointSymbol3D from '@arcgis/core/symbols/PointSymbol3D';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer';

@Component({
  selector: 'app-layer-editor',
  templateUrl: './layer-editor.component.html',
  styleUrls: ['./layer-editor.component.scss'],
})
export class LayerEditorComponent {
  @Output() cancel: EventEmitter<void> = new EventEmitter<void>();
  @Output() save: EventEmitter<LayerProperties> = new EventEmitter<LayerProperties>();
  @Input() layer: FeatureLayerProperties | undefined;
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
    this.cancel.emit();
  }

}
