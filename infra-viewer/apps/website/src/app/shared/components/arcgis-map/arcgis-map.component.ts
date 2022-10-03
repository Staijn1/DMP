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
import {getMB} from '@infra-viewer/interfaces';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import {QueryService} from '../../../services/query/query.service';
import SearchSource from '@arcgis/core/widgets/Search/SearchSource';
import ViewClickEvent = __esri.ViewClickEvent;
import Daylight from '@arcgis/core/widgets/Daylight';
import Weather from '@arcgis/core/widgets/Weather';
import ShadowCast from '@arcgis/core/widgets/ShadowCast';
@Component({
  selector: 'app-arcgis-map',
  templateUrl: './arcgis-map.component.html',
  styleUrls: ['./arcgis-map.component.scss'],
})
export class ArcgisMapComponent implements OnInit {
  private map!: WebScene;
  private view!: SceneView;
  private readonly showPerformanceInfo = false;
  private searchWidget!: __esri.widgetsSearch;


  constructor(private readonly configService: ConfigurationService, private readonly queryService: QueryService) {
  }

  ngOnInit(): void {
    this.createMap().then(() => {
      this.createView();
      this.createUI();
      this.applyConfig().then();
      this.registerEvents();
    });
  }

  private async createMap(): Promise<void> {
    this.map = new WebScene({
      basemap: (await this.configService.getConfiguration()).basemap,
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
    this.searchWidget = new Search({
      view: this.view,
      container: document.createElement('div'),
    });

    const layerList = new LayerList({
      view: this.view,
    });

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

    const weatherExpand = new Expand({
      view: this.view,
      content: new Weather({
        view: this.view,
      }),
      group: "top-right"
    });

    const daylightExpand = new Expand({
      view: this.view,
      content: new Daylight({
        view: this.view
      }),
      group: "top-right"
    });
    const shadowWidget = new Expand({view: this.view, content: new ShadowCast({ view: this.view, }), group: "top-right"});

    shadowWidget.watch("expanded", (expanded) => {
      if (expanded){
        (shadowWidget.content as ShadowCast).viewModel.start();
      } else {
        (shadowWidget.content as ShadowCast).viewModel.stop();
      }
    });

    this.view.ui.add('performanceInfo', 'bottom-left');

    if (this.showPerformanceInfo)
      this.updatePerformanceInfo();

    this.view.ui.add([elevationProfileExpand, layerlistExpand], 'top-left');
    this.view.ui.add([this.searchWidget, weatherExpand, daylightExpand, shadowWidget], "top-right");
    // this.view.ui.add(new QueryBuilderWidget(),"top-right")
  }

  private async applyConfig(): Promise<void> {
    const config = await this.configService.getConfiguration();
    const createPopupTemplate = (layer: GeoJSONLayer | FeatureLayer): PopupTemplate => {
      if (!layer.fields) return new PopupTemplate();
      return new PopupTemplate({
        title: layer.title,
        // Create content for the popup for each field
        content: layer.fields.map((field: any) => `${field.name}: {${field.name}}`).join('<br>')
      })
    };

    const elevationLayer = new ElevationLayer(config.elevationLayer);
    this.map.ground.layers.add(elevationLayer);

    const constructedLayers: any[][] = [];
    for (const sceneLayerConfig of config.scenelayers) {
      const sceneLayer = new SceneLayer(sceneLayerConfig);
      constructedLayers.push([sceneLayer, sceneLayerConfig]);
    }

    for (const featureLayerConfig of config.featurelayers) {
      const featureLayer = new FeatureLayer(featureLayerConfig);
      constructedLayers.push([featureLayer, featureLayerConfig]);
    }

    for (const geoJSONLayerConfig of config.geoJSONLayers) {
      const geoJSONLayer = new GeoJSONLayer(geoJSONLayerConfig);
      constructedLayers.push([geoJSONLayer, geoJSONLayerConfig]);
    }

    for (const constructedLayer of constructedLayers) {
      const layer = constructedLayer[0];
      const layerConfig = constructedLayer[1];
      // Create a popup template if the layer is not a scene layer
      if (layer.type !== 'scene') {
        layer.when(() => {
          layer.popupTemplate = createPopupTemplate(layer);
        });
      }

      if (layerConfig.searchConfig) {
        this.searchWidget.sources.push(new SearchSource({layer: layer, ...layerConfig.searchConfig}));
      }

      this.map.add(layer);
    }

    this.map.ground.navigationConstraint = {
      type: 'none',
    };
    this.map.ground.opacity = 0.4;
  }

  registerEvents() {
    this.view.on('immediate-click' as any, (event: ViewClickEvent) => this.onViewClick(event));
  }

  private onViewClick(event: __esri.ViewClickEvent) {
    this.filterFeaturesByDistance(event.mapPoint);
  }

  private filterFeaturesByDistance(mapPoint: __esri.Point) {
    // Todo: implement
    /*const circleSymbol = {
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
    });*/
  }

  private updatePerformanceInfo() {
    const performanceInfo = this.view.performanceInfo;
    this.updateMemoryTitle(performanceInfo.usedMemory, performanceInfo.totalMemory, performanceInfo.quality);
    this.updateTables(performanceInfo);
    setTimeout(() => this.updatePerformanceInfo(), 1000);
  }

  private updateMemoryTitle(usedMemory: number, totalMemory: number, quality: number) {
    const title = document.getElementById('title') as HTMLElement;
    title.innerHTML = `Memory: ${getMB(usedMemory)}MB/${getMB(totalMemory)}MB  -  Quality: ${Math.round(100 * quality)} %`;
  }

  private updateTables(stats: __esri.SceneViewPerformanceInfo
  ) {
    const tableMemoryContainer = document.getElementById('memory') as HTMLElement;
    const tableCountContainer = document.getElementById('count') as HTMLElement;
    tableMemoryContainer.innerHTML = `<tr>
            <th>Resource</th>
            <th>Memory(MB)</th>
          </tr>`;

    for (const layerInfo of stats.layerPerformanceInfos) {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${layerInfo.layer.title}</td><td class="center">${getMB(layerInfo.memory)}</td>`;
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
}
