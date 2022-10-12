import {Component} from '@angular/core';
import {ConfigurationService} from '../../services/configuration/configuration.service';
import {NgForm} from '@angular/forms';
import {SystemConfiguration} from '@infra-viewer/interfaces';
import Layer from '@arcgis/core/layers/Layer';
import FeatureLayerProperties = __esri.FeatureLayerProperties;

@Component({
  selector: 'app-config-page',
  templateUrl: './config-page.component.html',
  styleUrls: ['./config-page.component.scss'],
})
export class ConfigPageComponent {
  selectedLayer: FeatureLayerProperties | undefined;
  configuration!: SystemConfiguration;
  private configurationBackup!: SystemConfiguration;

  get configurationString() {
    return JSON.stringify(this.configuration, null, 2);
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
  onConfigurationSubmit(configuration: NgForm | SystemConfiguration) {
    let config: SystemConfiguration;
    if (configuration instanceof NgForm) {
      config = configuration.value.configuration;
    } else {
      config = configuration;
    }
    this.configService.setConfiguration(config).then(() => this.getInformation());
  }

  /**
   * When the user clicks on save, we need to
   */
  onLayerConfigSave() {
    this.onConfigurationSubmit(this.configuration);
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
}
