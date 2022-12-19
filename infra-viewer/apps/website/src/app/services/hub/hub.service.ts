import { Injectable } from "@angular/core";
import Portal from "@arcgis/core/portal/Portal";
import PortalQueryResult from "@arcgis/core/portal/PortalQueryResult";
import { environment } from "../../../environments/environment";
import PortalQueryParams from "@arcgis/core/portal/PortalQueryParams";
import { HTTPService } from "../HTTP/http.service";
import { AuthenticationService } from "../authentication/authentication.service";
import { ServiceInfo } from "@infra-viewer/interfaces";
import { MessageService } from "../message-service/message.service";

@Injectable({
  providedIn: "root"
})
export class HubService extends HTTPService {
  constructor(messageService: MessageService, private readonly authService: AuthenticationService) {
    super(messageService);
  }

  queryItems(options: PortalQueryParams): Promise<PortalQueryResult> {
    const portal = new Portal({ url: environment.portalURL });
    portal.authMode = "immediate";

    return portal.queryItems(options);
  }

  buildQuery(filter: { owner: string; search: undefined; start: number }) {
    const ownerQuery = `owner: ${filter.owner || "GeoPortaal"}`;
    const searchQuery = filter.search ? `AND title: ${filter.search}` : "";
    const typeQuery = `type: (service)`;

    // Start off with a query for all items in the portal
    const query = new PortalQueryParams({
      query: `${typeQuery} AND ${ownerQuery} ${searchQuery}`,
      start: filter.start,
      num: 20,
      sortField: "modified",
      sortOrder: "desc"
    });

    return query;
  }

  /**
   * Get information of the service, like drawingInfo, sublayers and capabilities
   * @param {string} serviceUrl
   * @returns {Promise<any>}
   */
  async getServiceInfo(serviceUrl: string): Promise<ServiceInfo> {
    let url = `${serviceUrl}?f=json`;
    if (serviceUrl.includes("geo.arnhem.nl")) {
      url += "&token=" + this.authService.token;
    }
    return this.request(url, { method: "GET" });
  }
}
