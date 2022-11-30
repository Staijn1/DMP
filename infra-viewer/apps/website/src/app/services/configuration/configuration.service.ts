import {Injectable, OnDestroy} from '@angular/core';
import {HTTPService} from '../HTTP/http.service';
import {environment} from '../../../environments/environment';
import {HubItem, LayerConfig, SystemConfiguration, SystemConfigurationLayerTypes} from '@infra-viewer/interfaces';
import {getTypeForHubItem} from '../../utils/utils';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService extends HTTPService implements OnDestroy {
  public static configuration: SystemConfiguration | null = null;

  async getConfiguration(force?: boolean): Promise<SystemConfiguration> {
    if (ConfigurationService.configuration && !force) return ConfigurationService.configuration;

    const config = await this.request(`${environment.api}/System/Configuration`, {});
    ConfigurationService.configuration = config;
    return config;
  }

  async setConfiguration(configuration: SystemConfiguration | string): Promise<void> {
    if (typeof configuration === 'object') configuration = JSON.stringify(configuration);

    return this.request(`${environment.api}/System/Configuration`, {
      method: 'POST',
      body: configuration,
      headers: {'Content-Type': 'application/json'}
    });
  }

  ngOnDestroy(): void {
    ConfigurationService.configuration = null;
  }

  async addLayer(hubItem: HubItem): Promise<void> {
    const configuration = await this.getConfiguration();

    const layer: any = {
      url: hubItem.url,
      title: hubItem.title.replace(/_/g, ' '),
      type: getTypeForHubItem(hubItem),
    }
    configuration.layers.push(layer);

    await this.setConfiguration(configuration);
  }

  async removeLayer(hubItem: HubItem | LayerConfig) {
    const configuration = await this.getConfiguration();

    configuration.layers = configuration.layers.filter(l => l.url !== hubItem.url);

    await this.setConfiguration(configuration);
  }
}
