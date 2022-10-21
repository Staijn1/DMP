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

  async getConfiguration(force?: boolean): Promise<SystemConfiguration> {
    if (ConfigurationService.configuration && !force) return ConfigurationService.configuration;

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

  ngOnDestroy(): void {
    ConfigurationService.configuration = null;
  }
}
