import {Component, OnDestroy, ViewChild} from '@angular/core';
import {ConfigurationService} from '../../services/configuration/configuration.service';
import {NgForm} from '@angular/forms';
import {LayerConfig, SystemConfiguration} from '@infra-viewer/interfaces';
import UIkit from 'uikit';
import {swipeLeftAnimation} from '@infra-viewer/ui';
import {LayerEditorComponent} from '../../shared/components/layer-editor/layer-editor.component';
import FeatureLayerProperties = __esri.FeatureLayerProperties;


@Component({
  selector: 'app-config-page',
  animations: [swipeLeftAnimation],
  templateUrl: './config-page.component.html',
  styleUrls: ['./config-page.component.scss'],
})
export class ConfigPageComponent implements OnDestroy {
  @ViewChild(LayerEditorComponent) editor!: LayerEditorComponent;
  @ViewChild('advancedForm') advancedForm!: NgForm;
  selectedLayer: LayerConfig | undefined;
  configuration!: SystemConfiguration;
  private configurationBackup!: SystemConfiguration;

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

  getInformation(force?: boolean) {
    this.configService.getConfiguration(force).then(config => this.configuration = config);
  }

  /**
   * This method is called by the form for advanced editing or when saving an individual layer
   * @param {NgForm | SystemConfiguration} configuration
   */
  onConfigurationSubmit(configuration: SystemConfiguration) {
    this.configService.setConfiguration(configuration).then(() => {
      this.editor.close();
      this.getInformation()
    });
  }

  onAdvancedConfigSubmit() {
    this.onConfigurationSubmit(this.configuration);
  }

  /**
   * When the user clicks on save, we need to
   */
  onLayerConfigSave(layer: FeatureLayerProperties) {
    // Find the layer in the configuration and replace it with the new one
    this.configuration.layers = this.configuration.layers.map((l: LayerConfig) => {
      if (l.url === layer.url) {
        return layer;
      }
      return l;
    }) as LayerConfig[];

    this.onConfigurationSubmit(this.configuration);
  }

  startEditingLayer(layer: LayerConfig) {
    // DO NOT create a copy of the layer, we need to modify the original object
    this.selectedLayer = layer;
    // DO copy the whole configuration, in case the user cancels we can restore this original copy
    this.configurationBackup = JSON.parse(JSON.stringify(this.configuration));
    this.editor.startEditing(this.selectedLayer);
  }

  deleteLayer(layer: FeatureLayerProperties) {
    // Create a UIKit dialog to confirm the deletion
    UIkit.modal.confirm('Are you sure you want to delete this layer?').then(() => {
      // Remove the layer from the configuration
      this.configuration.layers = this.configuration.layers.filter((l: LayerConfig) => l.url !== layer.url);
      // Save the configuration
      this.onConfigurationSubmit(this.configuration);
    }, () => {
      // Do nothing if the user cancels
    });
  }

  toggleLayerVisibility(layer: FeatureLayerProperties) {
    layer.visible = layer.visible === undefined ? true : layer.visible;
    layer.visible = !layer.visible;
    this.onLayerConfigSave(layer)
  }

  ngOnDestroy(): void {
    this.configuration = {} as SystemConfiguration;
  }
}
