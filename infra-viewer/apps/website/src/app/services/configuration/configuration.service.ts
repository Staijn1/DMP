import {Injectable, OnDestroy} from '@angular/core';
import {HTTPService} from '../HTTP/http.service';
import {environment} from '../../../environments/environment';
import {SystemConfiguration} from '@infra-viewer/interfaces';
import esriConfig from '@arcgis/core/config';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService extends HTTPService implements OnDestroy {
  private static configuration: SystemConfiguration | null = null;

  async getConfiguration(): Promise<SystemConfiguration> {
    if (ConfigurationService.configuration) return ConfigurationService.configuration;

    return this.request(`${environment.api}/System/Configuration`, {});
  }

  async setConfiguration(configuration: SystemConfiguration | string): Promise<void> {
    if (typeof configuration === 'object') configuration = JSON.stringify(configuration);

    return this.request(`${environment.api}/System/Configuration`, {
      method: 'POST',
      body: configuration,
      headers: {'Content-Type': 'application/json'}
    });
  }

  public setArcgisKey(): void {
    esriConfig.apiKey = environment.arcgisKey;
  }

  ngOnDestroy(): void {
    ConfigurationService.configuration = null;
  }
}
