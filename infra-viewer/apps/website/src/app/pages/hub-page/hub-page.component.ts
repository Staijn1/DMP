import {Component, OnInit} from '@angular/core';
import {HubService} from '../../services/hub/hub.service';
import {environment} from '../../../environments/environment';
import {AuthenticationService} from '../../services/authentication/authentication.service';
import {HubItem} from '@infra-viewer/interfaces';
import {ConfigurationService} from '../../services/configuration/configuration.service';
import PortalQueryParams from '@arcgis/core/portal/PortalQueryParams';

@Component({
  selector: 'app-hub-page',
  templateUrl: './hub-page.component.html',
  styleUrls: ['./hub-page.component.scss'],
})
export class HubPageComponent implements OnInit {
  hubItems: HubItem[] = [];
  filter = {
    search: undefined,
    owner: 'GeoPortaal',
    start: 1
  };

  query!: PortalQueryParams;
  hasMoreItems = false;

  constructor(private readonly hubService: HubService, private authService: AuthenticationService, private readonly configurationService: ConfigurationService) {
  }

  ngOnInit(): void {
    this.getItems();
  }

  createImageUrl(hubItem: HubItem) {
    return `${environment.portalURL}/sharing/rest/content/items/${hubItem.id}/info/${hubItem.thumbnail}?token=${this.authService.token}`;
  }

  createUrlToPortalItem(hubItem: HubItem) {
    return `${environment.portalURL}/home/item.html?id=${hubItem.id}`;
  }

  getItems() {
    this.query = this.hubService.buildQuery(this.filter);
    this.hubService.queryItems(this.query).then(r => {
      // When there are no more results the start property is set to -1
      this.hasMoreItems = r.nextQueryParams.start > 0;
      this.filter.start = r.nextQueryParams.start;
      this.hubItems = this.hubItems.concat(r.results);
    });
  }

  transformTitle(hubItem: HubItem) {
    return hubItem.title.replace(/_/g, ' ');
  }

  addLayerToConfiguration(hubItem: HubItem) {
    this.configurationService.addLayer(hubItem).then();
  }

  removeLayerFromConfiguration(hubItem: HubItem) {
    this.configurationService.removeLayer(hubItem).then();
  }

  /**
   * If the layer with the given url is already in the configuration, return true.
   * @param {HubItem} hubItem
   * @returns {Promise<boolean>}
   */
  layerAlreadyInConfiguration(hubItem: HubItem) {
    return ConfigurationService.configuration?.layers.some(l => l.url?.includes(hubItem.url) || hubItem.url?.includes(l.url as string));
  }

  filterItems() {
    this.hubItems = [];
    this.getItems();
  }

  onThumbnailImageError($event: ErrorEvent) {
    const target = $event.target as HTMLImageElement;
    target.src = 'assets/empty_world.png';
  }
}
