import {Injectable} from '@angular/core';
import Portal from '@arcgis/core/portal/Portal';
import PortalQueryResult from '@arcgis/core/portal/PortalQueryResult';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HubService {

  queryItems(): Promise<PortalQueryResult> {
    const portal = new Portal({url: environment.portalURL});
    portal.authMode = 'immediate';
    return portal.queryItems({num: 20, start: 1, sortField: 'modified', query: 'owner: GeoPortaal'});
  }
}
