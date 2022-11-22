import {Component, ElementRef, ViewChild} from '@angular/core';
import {QueriedFeatures} from '@infra-viewer/interfaces';
import {ArcgisMapComponent} from '../../shared/components/arcgis-map/arcgis-map.component';
import UIkit from 'uikit';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import SceneLayer from '@arcgis/core/layers/SceneLayer';


@Component({
  selector: 'app-map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.scss'],
})
export class MapPageComponent {
  @ViewChild(ArcgisMapComponent) map!: ArcgisMapComponent;
  @ViewChild('switcher') switcher!: ElementRef;

  _results: QueriedFeatures[] = [];

  get results(): QueriedFeatures[] {
    return this._results.filter((result) => result.featureSet.features.length > 0);
  }

  set results(value: QueriedFeatures[]) {
    this._results = value;
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
   * @param layer
   */
  onGridFilterChange($event: __esri.Graphic[], layer: FeatureLayer | SceneLayer) {
    this.map.onFeatureGridFilterChange($event, layer);
  }

  /**
   * Fired when the user changes the filter in the map. It updates the feature grid that show the results of the query in a table
   * @param {QueriedFeatures[]} $event
   */
  onQuery($event: QueriedFeatures[]) {
    this.results = $event;
  }
}
