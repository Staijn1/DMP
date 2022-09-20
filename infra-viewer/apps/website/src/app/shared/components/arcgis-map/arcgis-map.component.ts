import {Component, OnInit} from '@angular/core';
import WebScene from '@arcgis/core/WebScene';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import SceneView from '@arcgis/core/views/SceneView';

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
}
