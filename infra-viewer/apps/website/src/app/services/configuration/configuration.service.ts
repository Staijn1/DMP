import {Injectable} from '@angular/core';
import {HTTPService} from '../HTTP/http.service';
import {environment} from '../../../environments/environment';
import {SystemConfiguration} from '@infra-viewer/interfaces';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService extends HTTPService {
  private configuration: SystemConfiguration | null = null;

  async getConfiguration(): Promise<SystemConfiguration> {
    if (this.configuration) return this.configuration;

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
}
