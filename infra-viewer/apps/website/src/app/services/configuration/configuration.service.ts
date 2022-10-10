import {Injectable} from '@angular/core';
import {HTTPService} from '../HTTP/http.service';
import {environment} from '../../../environments/environment';
import {SystemConfiguration} from '@infra-viewer/interfaces';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService extends HTTPService {
  async getConfiguration(): Promise<SystemConfiguration> {
    if (sessionStorage.getItem('configuration') && environment.production)
      return JSON.parse(sessionStorage.getItem('configuration') as string);

    const body = await this.request(`${environment.api}/System/Configuration`, {});
    sessionStorage.setItem('configuration', JSON.stringify(body));

    return body;
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
