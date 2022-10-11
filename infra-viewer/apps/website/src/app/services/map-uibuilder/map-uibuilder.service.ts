import {Injectable} from '@angular/core';
import Search from '@arcgis/core/widgets/Search';
import LayerList from '@arcgis/core/widgets/LayerList';
import Expand from '@arcgis/core/widgets/Expand';
import ElevationProfile from '@arcgis/core/widgets/ElevationProfile';
import Weather from '@arcgis/core/widgets/Weather';
import Daylight from '@arcgis/core/widgets/Daylight';
import ShadowCast from '@arcgis/core/widgets/ShadowCast';

@Injectable({
  providedIn: 'root'
})
export class MapUIBuilderService {
  private searchWidget!: __esri.widgetsSearch;


  buildUI(view: __esri.SceneView): void {
    this.searchWidget = new Search({
      view: view,
      container: document.createElement('div'),
    });

    const layerList = new LayerList({
      view: view,
    });

    const layerlistExpand = new Expand({
      view: view,
      content: layerList,
    });

    const elevationProfile = new ElevationProfile({
      view: view,
      profiles: [
        {
          type: 'ground', // first profile line samples the ground elevation
        },
        {
          type: 'view', // second profile line samples the view and shows building profiles
        },
      ],
      // hide the select button
      // this button can be displayed when there are polylines in the
      // scene to select and display the elevation profile for
      visibleElements: {
        selectButton: false,
      },
    });

    const elevationProfileExpand = new Expand({
      view: view,
      content: elevationProfile,
    });

    const weatherExpand = new Expand({
      view: view,
      content: new Weather({
        view: view,
      }),
      group: 'top-right'
    });

    const daylightExpand = new Expand({
      view: view,
      content: new Daylight({
        view: view
      }),
      group: 'top-right'
    });

    const shadowWidget = new Expand({view: view, content: new ShadowCast({view: view}), group: 'top-right'});
    (shadowWidget.content as ShadowCast).viewModel.stop();
    shadowWidget.watch('expanded', (expanded) => {
      if (expanded) {
        (shadowWidget.content as ShadowCast).viewModel.start();
      } else {
        (shadowWidget.content as ShadowCast).viewModel.stop();
      }
    });

    view.ui.add('performanceInfo', 'bottom-left');

    view.ui.add([elevationProfileExpand, layerlistExpand], 'top-left');
    view.ui.add([this.searchWidget, weatherExpand, daylightExpand, shadowWidget], 'top-right');
  }

  addSearch(source: __esri.SearchSource): void {
    this.searchWidget.sources.add(source);
  }
}