import {Component, OnInit} from '@angular/core';
import WebScene from '@arcgis/core/WebScene';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import SceneView from '@arcgis/core/views/SceneView';
import {ConfigurationService} from '../../../services/configuration/configuration.service';
import ElevationLayer from '@arcgis/core/layers/ElevationLayer';
import SceneLayer from '@arcgis/core/layers/SceneLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import {QueryService} from '../../../services/query/query.service';
import SearchSource from '@arcgis/core/widgets/Search/SearchSource';
import {createTablePopup} from '../../../utils/utils';
import {MapUIBuilderService} from '../../../services/map-uibuilder/map-uibuilder.service';
import {MapEventHandlerService} from '../../../services/map-event-handler/map-event-handler.service';
import ViewClickEvent = __esri.ViewClickEvent;
import * as projection from '@arcgis/core/geometry/projection';

@Component({
  selector: 'app-arcgis-map',
  templateUrl: './arcgis-map.component.html',
  styleUrls: ['./arcgis-map.component.scss'],
})
export class ArcgisMapComponent implements OnInit {
  private readonly targetWKID = 4326;
  private map!: WebScene;
  private view!: SceneView;

  constructor(
    private readonly configService: ConfigurationService,
    private readonly queryService: QueryService,
    private readonly uiBuilder: MapUIBuilderService,
    private readonly eventHandler: MapEventHandlerService) {
  }

  ngOnInit(): void {
    this.createMap().then(() => {
      this.createView();
      this.uiBuilder.buildUI(this.view);
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
    const extent = {
      // autocasts as new Extent()
      xmax: 6.041874,
      xmin: 5.784768,
      ymax: 52.096953,
      ymin: 51.927599,
      spatialReference: {
        // autocasts as new SpatialReference()
        wkid: this.targetWKID
      }
    };

    // Create the view
    this.view = new SceneView({
      clippingArea: extent,
      container: 'map',
      viewingMode: "local",
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

    const layersToProject = [];
    for (const [layer, layerConfig] of constructedLayers) {
      if (layer.spatialReference?.wkid !== this.targetWKID) {
        layersToProject.push(layer);
      }
    }
    /*  projection.load().then(() => {
        // Find all layers that need to be projected

        // project an array of geometries to the specified output spatial reference
        // wkid of WGS84 Web Mercator (Auxiliary Sphere) is 3857
        const projectedGeometries = projection.project(, 3857);
      });*/

    for (const constructedLayer of constructedLayers) {
      const layer = constructedLayer[0];
      const layerConfig = constructedLayer[1];
      // Create a popup template if the layer is not a scene layer
      if (layer.type !== 'scene') {
        this.uiBuilder.addLegendLayer(layer);
        layer.when(() => {
          layer.popupTemplate = createTablePopup(layer);
        });
      }

      if (layerConfig.searchConfig) {
        this.uiBuilder.addSearch(new SearchSource({...layerConfig.searchConfig, layer: layer}));
      }

      this.map.add(layer);
    }

    this.map.ground.navigationConstraint = {
      type: 'none',
    };
    this.map.ground.opacity = 0.4;
  }

  registerEvents() {
    this.view.on('immediate-click' as any, (event: ViewClickEvent) => this.eventHandler.onViewClick(event, this.view));
  }
}
