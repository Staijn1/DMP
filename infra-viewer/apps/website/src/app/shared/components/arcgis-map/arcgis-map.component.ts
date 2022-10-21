import {Component, OnInit} from '@angular/core';
import WebScene from '@arcgis/core/WebScene';
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
import Basemap from '@arcgis/core/Basemap';
import TileLayer from '@arcgis/core/layers/TileLayer';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import FeatureLayerView from '@arcgis/core/views/layers/FeatureLayerView';
import {HighlightStyleOptions} from 'ag-grid-community';

@Component({
  selector: 'app-arcgis-map',
  templateUrl: './arcgis-map.component.html',
  styleUrls: ['./arcgis-map.component.scss'],
})
export class ArcgisMapComponent implements OnInit {
  private map!: WebScene;
  view!: SceneView;
  private activeHighlight: __esri.Handle | undefined;

  constructor(
    private readonly configService: ConfigurationService,
    private readonly queryService: QueryService,
    private readonly uiBuilder: MapUIBuilderService,
    private readonly eventHandler: MapEventHandlerService) {
  }

  ngOnInit(): void {
    this.createMap()
    this.createView();
    this.uiBuilder.buildUI(this.view);
    this.applyConfig().then();
    this.eventHandler.registerEvents(this.view);
  }

  private createMap(): void {
    this.map = new WebScene({
      basemap: new Basemap({
        baseLayers: [
          new TileLayer({
            url: 'https://services.arcgisonline.nl/arcgis/rest/services/Luchtfoto/Luchtfoto/MapServer'
          }),
          new VectorTileLayer({
            url: 'https://tiles.arcgis.com/tiles/nSZVuSZjHpEZZbRo/arcgis/rest/services/OSM_RD/VectorTileServer',
            blendMode: 'multiply'
          }),
        ],
      }),
      layers: [],
    });
  }


  private createView(): void {
    const extent = {
      // autocasts as new Extent()
      xmin: 151575.98477672008,
      ymin: 433495.6075078908,
      xmax: 232549.08692756083,
      ymax: 453749.52060500067,
      spatialReference: {
        wkid: 28992,
      }
    };

    // Create the view
    this.view = new SceneView({
      highlightOptions: {
        color: [255, 255, 0, 1],
        haloColor: 'white',
        haloOpacity: 0.9,
        fillOpacity: 0.2,
        shadowColor: 'black',
        shadowOpacity: 0.5
      } as HighlightStyleOptions,
      spatialReference: {wkid: 28992},
      qualityProfile: 'low',
      clippingArea: extent,
      container: 'map',
      viewingMode: 'local',
      map: this.map,
      environment: {
        lighting: {
          type: 'sun',
          directShadowsEnabled: true,
          ambientOcclusionEnabled: true
        }
      },
      camera: {
        // The spatial reference is not in the type but does make it work, so we cast it to any
        spatialReference: {
          wkid: 28992
        },
        x: 190871.79970213366,
        y: 443752.26031690626,
        z: 5966.512190682592
      } as any
    });

    // When a feature is clicked reset the highlight and zoom to the feature
    this.view.on('click', (event) => {
      if (this.activeHighlight) {
        this.activeHighlight.remove();
      }
    });
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
        this.uiBuilder.addLayerToLegend(layer);
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

  highlightAndZoomTo(graphic: __esri.Graphic) {
    // If the layer the graphic is in is hidden, show it
    if (!graphic.layer.visible) {
      graphic.layer.visible = true;
    }

    // Go to the graphic
    this.view.goTo({
      target: graphic.geometry,
      scale: 100
    }).then();
    // Highlight it with the configured highlight options in the view
    this.view.whenLayerView(graphic.layer as FeatureLayer).then((layerView: FeatureLayerView) => {
      if (this.activeHighlight) {
        this.activeHighlight.remove();
      }
      this.activeHighlight = layerView.highlight(graphic);
    });
  }
}
