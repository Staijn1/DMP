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
import Daylight from '@arcgis/core/widgets/Daylight';
import Weather from '@arcgis/core/widgets/Weather';
import ShadowCast from '@arcgis/core/widgets/ShadowCast';
import Portal from '@arcgis/core/portal/Portal';
import Layer from '@arcgis/core/layers/Layer';
import Collection from '@arcgis/core/core/Collection';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Color from '@arcgis/core/Color';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import ViewClickEvent = __esri.ViewClickEvent;
import {createTablePopup} from '../../../utils/utils';

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
  private queryResultLayer: __esri.GraphicsLayer | null = null;


  constructor(private readonly configService: ConfigurationService, private readonly queryService: QueryService) {
    // esriconfig.portalUrl = 'https://geo.arnhem.nl/portal';
  }

  ngOnInit(): void {
    this.authenticate();
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
      camera: {
        position: {
          latitude: 51.96437,
          longitude: 5.910011,
          z: 2500,
        },
        tilt: 30,
        heading: 0,
      },
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
      group: 'top-right'
    });

    const daylightExpand = new Expand({
      view: this.view,
      content: new Daylight({
        view: this.view
      }),
      group: 'top-right'
    });

    const shadowWidget = new Expand({view: this.view, content: new ShadowCast({view: this.view}), group: 'top-right'});
    (shadowWidget.content as ShadowCast).viewModel.stop();
    shadowWidget.watch('expanded', (expanded) => {
      if (expanded) {
        (shadowWidget.content as ShadowCast).viewModel.start();
      } else {
        (shadowWidget.content as ShadowCast).viewModel.stop();
      }
    });

    this.view.ui.add('performanceInfo', 'bottom-left');

    if (this.showPerformanceInfo)
      this.updatePerformanceInfo();

    this.view.ui.add([elevationProfileExpand, layerlistExpand], 'top-left');
    this.view.ui.add([this.searchWidget, weatherExpand, daylightExpand, shadowWidget], 'top-right');
    // this.view.ui.add(new QueryBuilderWidget(),"top-right")
  }

  private async applyConfig(): Promise<void> {
    const config = await this.configService.getConfiguration();

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
          layer.popupTemplate = createTablePopup(layer);
        });
      }

      if (layerConfig.searchConfig) {
        this.searchWidget.sources.push(new SearchSource({...layerConfig.searchConfig, layer: layer}));
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
    this.queryService.queryOnLocation(event.mapPoint, this.map.layers as Collection<Layer>).then((results) => {
      // Disable all the layers
      this.map.layers.filter(layer => layer.type != 'scene').forEach((layer) => layer.visible = false);
      if (!this.queryResultLayer) {
        this.queryResultLayer = new GraphicsLayer({
          title: 'Query results',
          listMode: 'show',
          id: 'queryResults',
        });
      }

      const graphics = [];
      for (const result of results) {
        for (const feature of result.features) {
          graphics.push(feature);
        }
      }
      this.queryResultLayer.removeAll();
      this.queryResultLayer.addMany(graphics);
      this.queryResultLayer.visible = true;
      this.map.add(this.queryResultLayer);
    });
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

  private authenticate() {
    /* console.log("OAuth Info",IdentityManager.findOAuthInfo("https://geo.arnhem.nl/portal"))
     const info = new OAuthInfo({
       appId: 'YOUR-CLIENT-ID',
       popup: true // the default
     });
     IdentityManager.registerOAuthInfos([info]);

     IdentityManager
       .checkSignInStatus(info.portalUrl + '/sharing')
       .then(() => this.handleSignIn())
       .catch((e) => console.log("Not signed in", e));*/
  }

  private handleSignIn(): void {
    const portal = new Portal();
    portal.load().then(() => {
      const results = {name: portal.user.fullName, username: portal.user.username};
      console.log('Results', results)
    });
  }
}
