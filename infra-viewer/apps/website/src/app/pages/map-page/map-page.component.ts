import {Component, ElementRef, ViewChild} from '@angular/core';
import {MapEventHandlerService} from '../../services/map-event-handler/map-event-handler.service';
import {QueriedFeatures} from '@infra-viewer/interfaces';
import {ArcgisMapComponent} from '../../shared/components/arcgis-map/arcgis-map.component';
import UIkit from 'uikit';
import Layer from '@arcgis/core/layers/Layer';


@Component({
  selector: 'app-map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.scss'],
})
export class MapPageComponent {
  @ViewChild(ArcgisMapComponent) map!: ArcgisMapComponent;
  @ViewChild('switcher') switcher!: ElementRef;

  results: QueriedFeatures[] = [];

  constructor(private readonly eventHandler: MapEventHandlerService) {
  }


  showTab(result: QueriedFeatures) {
    // Find the index of the result in the results array
    const index = this.results?.indexOf(result);
    // If the index is found, switch to the tab with that index
    if (index !== undefined) {
      UIkit.switcher(this.switcher.nativeElement).show(index);
    }
  }

  /**
   * This method is called when the user changes the filtering in the grid that appears after a query.
   * This function calls the eventhandler that will deal with it further
   * @param {__esri.Graphic[]} $event
   */
  onGridFilterChange($event: __esri.Graphic[], layer: Layer) {
    this.eventHandler.onFilterChange($event, layer, this.map.view);
  }

  onQuery($event: QueriedFeatures[]) {
    this.results = $event;
  }
}
