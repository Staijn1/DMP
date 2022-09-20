import {Component, OnInit} from '@angular/core';
import WebScene from '@arcgis/core/WebScene';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import SceneView from '@arcgis/core/views/SceneView';
import ElevationProfile from '@arcgis/core/widgets/ElevationProfile';
import Search from '@arcgis/core/widgets/Search';
import LayerList from '@arcgis/core/widgets/LayerList';
import Expand from '@arcgis/core/widgets/Expand';

@Component({
  selector: 'app-arcgis-map',
  templateUrl: './arcgis-map.component.html',
  styleUrls: ['./arcgis-map.component.scss'],
})
export class ArcgisMapComponent implements OnInit {

  ngOnInit(): void {
    this.createMap();
  }

  private createMap(): void {
    const map = new WebScene({
      basemap: 'hybrid',
      layers: []
    });

    this.createView(map)
  }

  private createView(map: WebScene): void {
    // Create the view
    const view = new SceneView({
      container: 'map',
      map: map,
      environment: {
        lighting: {
          date: new Date(),
          directShadowsEnabled: true
        },
        atmosphere: {
          quality: 'low'
        }
      }
    });
    this.createUI(view);
    view
      .when(() => {
        view.goTo({
          position: {
            latitude: 51.964370,
            longitude: 5.910011,
            z: 2500
          },
          tilt: 30,
          heading: 0
        }).then();

        const sketchVM = new SketchViewModel({
          view: view
        });

        sketchVM.on('create', (event) => {
          if (event.state === 'complete') {
            sketchVM.update(event.graphic);
          }
        });
      })
      .catch(console.error);
  }

  private createUI(view: SceneView): void {
    const searchWidget = new Search({
      view: view,
      container: document.createElement('div'),
    });

    const layerList = new LayerList({
      view: view
    })

    const layerlistExpand = new Expand({
      view: view,
      content: layerList,
    })

    const elevationProfile = new ElevationProfile({
      view: view,
      profiles: [{
        type: 'ground' // first profile line samples the ground elevation
      }, {
        type: 'view' // second profile line samples the view and shows building profiles
      }],
      // hide the select button
      // this button can be displayed when there are polylines in the
      // scene to select and display the elevation profile for
      visibleElements: {
        selectButton: false
      }
    });

    const elevationProfileExpand = new Expand({
      view: view,
      content: elevationProfile
    });


    view.ui.add(elevationProfileExpand, 'top-left');
    view.ui.add(layerlistExpand, 'top-left');
    view.ui.add(searchWidget, 'top-right');
  }
}
