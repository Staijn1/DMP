import {Injectable} from '@angular/core';
import Portal from '@arcgis/core/portal/Portal';
import PortalQueryResult from '@arcgis/core/portal/PortalQueryResult';
import {environment} from '../../../environments/environment';
import PortalQueryItemsOptions = __esri.PortalQueryItemsOptions;
import PortalQueryParams from '@arcgis/core/portal/PortalQueryParams';
import PortalQueryParamsProperties = __esri.PortalQueryParamsProperties;

@Injectable({
  providedIn: 'root'
})
export class HubService {

  queryItems(options?: PortalQueryParams | PortalQueryParamsProperties): Promise<PortalQueryResult> {
    const portal = new Portal({url: environment.portalURL});
    portal.authMode = 'immediate';
    options = {...{num: 20, start: 1, sortField: 'modified', query: 'owner: GeoPortaal'}, ...options};
    return portal.queryItems(options);
  }
}
