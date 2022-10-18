import {Component, OnDestroy} from '@angular/core';
import {MapEventHandlerService} from '../../services/map-event-handler/map-event-handler.service';
import {Subscription} from 'rxjs';
import FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import FeatureLayerProperties = __esri.FeatureLayerProperties;

@Component({
  selector: 'app-map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.scss'],
})
export class MapPageComponent implements OnDestroy {
  private featureSubscription: Subscription;
  results: { featureSet: FeatureSet, layer: FeatureLayerProperties }[] | null = null;

  constructor(private readonly eventHandler: MapEventHandlerService) {
    this.featureSubscription = eventHandler.queredFeatures$.subscribe(results =>this.results = results)
  }

  ngOnDestroy(): void {
    this.featureSubscription.unsubscribe();
  }
}
