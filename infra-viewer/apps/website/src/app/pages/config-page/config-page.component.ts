import {Component, ElementRef, ViewChild} from '@angular/core';
import {ConfigurationService} from '../../services/configuration/configuration.service';
import {NgForm} from '@angular/forms';
import {SystemConfiguration, SystemConfigurationLayerTypes} from '@infra-viewer/interfaces';
import Layer from '@arcgis/core/layers/Layer';
import UIkit from 'uikit';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer';
import UniqueValueInfo from '@arcgis/core/renderers/support/UniqueValueInfo';
import FeatureLayerProperties = __esri.FeatureLayerProperties;
import PointSymbol3D from '@arcgis/core/symbols/PointSymbol3D';
import LayerProperties = __esri.LayerProperties;


@Component({
  selector: 'app-config-page',
  templateUrl: './config-page.component.html',
  styleUrls: ['./config-page.component.scss'],
})
export class ConfigPageComponent {
  @ViewChild('modal') modalRef!: ElementRef;
  @ViewChild('advancedForm') advancedForm!: NgForm;
  selectedLayer: FeatureLayerProperties | undefined;
  configuration!: SystemConfiguration;
  private configurationBackup!: SystemConfiguration;
  UniqueValueRenderer = UniqueValueRenderer;

  get configurationString() {
    return JSON.stringify(this.configuration, null, 2);
  }

  set configurationString(value: string) {
    try {
      this.configuration = JSON.parse(value);
    } catch (e) {
      this.advancedForm.controls['advancedConfiguration'].setErrors({json: true});
    }
  }

  constructor(private readonly configService: ConfigurationService) {
    this.getInformation();
  }

  private getInformation() {
    this.configService.getConfiguration().then(config => this.configuration = config);
  }

  /**
   * This method is called by the form for advanced editing or when saving an individual layer
   * @param {NgForm | SystemConfiguration} configuration
   */
  onConfigurationSubmit(configuration: SystemConfiguration) {
    this.configService.setConfiguration(configuration).then(() => this.getInformation());
  }

  onAdvancedConfigSubmit() {
    console.log(this.configuration);
  }

  /**
   * When the user clicks on save, we need to
   */
  onLayerConfigSave() {
    this.onConfigurationSubmit(this.configuration);
    UIkit.modal(this.modalRef.nativeElement).hide();
  }

  selectLayer(layer: Layer) {
    // DO NOT create a copy of the layer, we need to modify the original object
    this.selectedLayer = layer;
    // DO copy the whole configuration, in case the user cancels we can restore this original copy
    this.configurationBackup = JSON.parse(JSON.stringify(this.configuration));
  }

  /**
   * When the user clicks on cancel, we need to restore the original configuration
   */
  cancelEdit() {
    this.configuration = this.configurationBackup;
  }

  addElevationInfo() {
    if (!this.selectedLayer) return;
    this.selectedLayer.elevationInfo = {
      mode: 'on-the-ground',
      unit: 'meters',
      offset: 0,
    };
  }

  deleteLayer(layer: FeatureLayerProperties, type: SystemConfigurationLayerTypes) {
    // Create a UIKit dialog to confirm the deletion
    UIkit.modal.confirm('Are you sure you want to delete this layer?').then(() => {
      // Remove the layer from the configuration
      this.configuration[type] = this.configuration[type].filter((l: LayerProperties) => l.id !== layer.id);
      // Save the configuration
      this.onConfigurationSubmit(this.configuration);
    }, () => {
      // Do nothing if the user cancels
    });
  }

  toggleVisibility(layer: FeatureLayerProperties, type: SystemConfigurationLayerTypes) {
    layer.visible = layer.visible === undefined ? true : layer.visible;
    layer.visible = !layer.visible;
    this.onLayerConfigSave()
  }

  createRenderer() {
    if (!this.selectedLayer) return;
    this.selectedLayer.renderer = new UniqueValueRenderer();
  }

  addUniqueValue() {
    if (!this.selectedLayer) return;
    if (!this.selectedLayer.renderer) return;
    (this.selectedLayer.renderer as UniqueValueRenderer).uniqueValueInfos.push(new UniqueValueInfo({
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
}
