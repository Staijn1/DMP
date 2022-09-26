import {Component, OnInit} from '@angular/core';
import WebScene from '@arcgis/core/WebScene';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import SceneView from '@arcgis/core/views/SceneView';
import ElevationProfile from '@arcgis/core/widgets/ElevationProfile';
import Search from '@arcgis/core/widgets/Search';
import LayerList from '@arcgis/core/widgets/LayerList';
import Expand from '@arcgis/core/widgets/Expand';
import {ConfigurationService} from '../../../services/configuration/configuration.service';
import ElevationLayer from '@arcgis/core/layers/ElevationLayer';
import SceneLayer from '@arcgis/core/layers/SceneLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import Circle from '@arcgis/core/geometry/Circle';
import Graphic from '@arcgis/core/Graphic';
import Query from '@arcgis/core/rest/support/Query';
import FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import FeatureLayerView from '@arcgis/core/views/layers/FeatureLayerView';
import FeatureFilter from '@arcgis/core/layers/support/FeatureFilter';
import FeatureEffect from '@arcgis/core/layers/support/FeatureEffect';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import ViewClickEvent = __esri.ViewClickEvent;

@Component({
  selector: 'app-arcgis-map',
  templateUrl: './arcgis-map.component.html',
  styleUrls: ['./arcgis-map.component.scss'],
})
export class ArcgisMapComponent implements OnInit {
  private map!: WebScene;
  private view!: SceneView;


  constructor(private readonly configService: ConfigurationService) {
  }

  ngOnInit(): void {
    this.createMap();
    this.createView();
    this.applyConfig().then();
    this.createUI();
    this.registerEvents();
  }

  private createMap(): void {
    this.map = new WebScene({
      basemap: 'hybrid',
      layers: [],
    });
  }

  private createView(): void {
    // Create the view
    this.view = new SceneView({
      container: 'map',
      map: this.map,
      environment: {
        lighting: {
          date: new Date(),
          directShadowsEnabled: true,
        },
        atmosphere: {
          quality: 'low',
        },
      },
    });

    this.view
      .when(() => {
        this.view
          .goTo({
            position: {
              latitude: 51.96437,
              longitude: 5.910011,
              z: 2500,
            },
            tilt: 30,
            heading: 0,
          })
          .then();

        const sketchVM = new SketchViewModel({
          view: this.view,
        });

        sketchVM.on('create', (event) => {
          if (event.state === 'complete') {
            sketchVM.update(event.graphic);
          }
        });
      })
      .catch(console.error);
  }

  private createUI(): void {
    const searchWidget = new Search({
      view: this.view,
      container: document.createElement('div'),
    });

    const layerList = new LayerList({
      view: this.view,
    });
    layerList.on('trigger-action', (event) => this.onLayerlistTriggerAction(event, layerList));
    const layerlistExpand = new Expand({
      view: this.view,
      content: layerList,
    });

    const elevationProfile = new ElevationProfile({
      view: this.view,
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
      view: this.view,
      content: elevationProfile,
    });

    this.view.ui.add('performanceInfo', 'bottom-left');
    this.updatePerformanceInfo();

    this.view.ui.add(elevationProfileExpand, 'top-left');
    this.view.ui.add(layerlistExpand, 'top-left');
    this.view.ui.add(searchWidget, 'top-right');
  }

  private async applyConfig(): Promise<void> {
    const config = await this.configService.getConfiguration();

    const elevationLayer = new ElevationLayer(config.elevationLayer);
    this.map.ground.layers.add(elevationLayer);

    for (const sceneLayerConfig of config.scenelayers) {
      const sceneLayer = new SceneLayer(sceneLayerConfig);
      this.map.add(sceneLayer);
    }

    for (const featureLayerConfig of config.featurelayers) {
      const featureLayer = new FeatureLayer(featureLayerConfig);
      this.map.add(featureLayer);
      this.view.whenLayerView(featureLayer).then((layerView: FeatureLayerView) => {
        layerView.featureEffect = new FeatureEffect({
          excludedEffect: 'opacity(25%)',
          includedEffect: 'opacity(100%)'
        });
        console.log('FeatureLayerView', layerView);
      });
    }

    for (const geoJSONLayerConfig of config.geoJSONLayers) {
      const geoJSONLayer = new GeoJSONLayer(geoJSONLayerConfig);
      this.map.add(geoJSONLayer);
    }
  }

  private registerEvents() {
    this.view.on('immediate-click' as any, (event: ViewClickEvent) => this.onViewClick(event));
  }


  private onLayerlistTriggerAction(event: __esri.LayerListTriggerActionEvent, layerList: __esri.LayerList | __esri.LayerList) {
    console.log(event)
  }

  private onViewClick(event: __esri.ViewClickEvent) {
    this.filterFeaturesByDistance(event.mapPoint);
  }

  private filterFeaturesByDistance(mapPoint: __esri.Point) {
    const circleSymbol = {
      type: 'point-3d',
      symbolLayers: [
        {
          type: 'icon',
          outline: {color: [0, 0, 0, 1]},
          material: {color: [255, 255, 255, 0]}
        },
        {type: 'object', material: {color: [255, 255, 255, 1]}}
      ]
    };
    const circle = new Circle({
      center: mapPoint,
      geodesic: true,
      radius: 100,
      radiusUnit: 'meters'
    });
//Clear graphics
    this.view.graphics.removeAll();
    const graphic = new Graphic({
      symbol: circleSymbol,
      geometry: circle
    } as any);
    this.view.graphics.add(graphic);

    const query = new Query({returnGeometry: true, geometry: circle.extent});

    this.map.layers.forEach(layer => {
      if (layer.type === 'scene') {
        const sceneLayer = layer as any;
        sceneLayer.queryFeatures(query).then((results: FeatureSet) => {
          sceneLayer.featureEffect = new FeatureFilter({
            objectIds: results.features.map(feature => feature.attributes.OBJECTID)
          });
        });
      }

      if (['geojson', 'feature'].includes(layer.type)) {
        layer.visible = false;
        (layer as FeatureLayer).queryFeatures(query).then((featureSet: FeatureSet) => {
          if (featureSet.features.length > 0) {
            const graphicsLayer = new GraphicsLayer({
              title: 'Search results',
            });
            this.view.graphics.addMany(featureSet.features);
            this.map.add(graphicsLayer);
          }
        })
      }
    });
  }

  selectInBuffer(response: FeatureSet): void {
    console.log(response)
  }

  private updatePerformanceInfo() {
    const performanceInfo = this.view.performanceInfo;
    this.updateMemoryTitle(performanceInfo.usedMemory, performanceInfo.totalMemory, performanceInfo.quality);
    this.updateTables(performanceInfo);
    setTimeout(() => this.updatePerformanceInfo(), 1000);
  }

  private updateMemoryTitle(usedMemory: number, totalMemory: number, quality: number) {
    const title = document.getElementById('title') as HTMLElement;
    title.innerHTML = `Memory: ${this.getMB(usedMemory)}MB/${this.getMB(totalMemory)}MB  -  Quality: ${Math.round(100 * quality)} %`;
  }

  private updateTables(stats: __esri.SceneViewPerformanceInfo) {
    const tableMemoryContainer = document.getElementById('memory') as HTMLElement;
    const tableCountContainer = document.getElementById('count') as HTMLElement;
    tableMemoryContainer.innerHTML = `<tr>
            <th>Resource</th>
            <th>Memory(MB)</th>
          </tr>`;

    for (const layerInfo of stats.layerPerformanceInfos) {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${layerInfo.layer.title}</td><td class="center">${this.getMB(layerInfo.memory)}</td>`;
      tableMemoryContainer.appendChild(row);
    }

    tableCountContainer.innerHTML = `<tr>
            <th>Layer - Features</th>
            <th>Displayed / Max<br>(count)</th>
            <th>Total<br>(count)</th>
          </tr>`;

    for (const layerInfo of stats.layerPerformanceInfos) {
      if (layerInfo.maximumNumberOfFeatures) {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${layerInfo.layer.title}`;
        row.innerHTML += `<td class="center">${
          layerInfo.displayedNumberOfFeatures ? layerInfo.displayedNumberOfFeatures : '-'
        } / ${layerInfo.maximumNumberOfFeatures ? layerInfo.maximumNumberOfFeatures : '-'}</td>`;
        row.innerHTML += `<td class="center">${
          layerInfo.totalNumberOfFeatures ? layerInfo.totalNumberOfFeatures : '-'
        }</td>`;
        tableCountContainer.appendChild(row);
      }
    }
  }

  private getMB(bytes: number) {
    const kilobyte = 1024;
    const megabyte = kilobyte * 1024;
    return Math.round(bytes / megabyte);
  }
}
