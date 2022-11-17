import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import WebScene from '@arcgis/core/WebScene';
import SceneView from '@arcgis/core/views/SceneView';
import {ConfigurationService} from '../../../services/configuration/configuration.service';
import ElevationLayer from '@arcgis/core/layers/ElevationLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import {QueryService} from '../../../services/query/query.service';
import {createTablePopup} from '../../../utils/utils';
import {MapUIBuilderService} from '../../../services/map-uibuilder/map-uibuilder.service';
import {MapEventHandlerService} from '../../../services/map-event-handler/map-event-handler.service';
import Basemap from '@arcgis/core/Basemap';
import TileLayer from '@arcgis/core/layers/TileLayer';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import FeatureLayerView from '@arcgis/core/views/layers/FeatureLayerView';
import {HighlightStyleOptions} from 'ag-grid-community';
import {QueriedFeatures, SystemConfiguration, SystemConfigurationLayerTypes} from '@infra-viewer/interfaces';
import {LayerFactoryService} from '../../../services/layer-factory/layer-factory.service';
import {SketchQueryWidgetComponent} from './widgets/SketchQueryWidget/sketch-query-widget.component';
import SceneLayer from '@arcgis/core/layers/SceneLayer';

@Component({
  selector: 'app-arcgis-map',
  templateUrl: './arcgis-map.component.html',
  styleUrls: ['./arcgis-map.component.scss'],
})
export class ArcgisMapComponent implements OnInit {
  @ViewChild(SketchQueryWidgetComponent) private sketchWidget!: SketchQueryWidgetComponent
  @Output() query: EventEmitter<QueriedFeatures[]> = new EventEmitter<QueriedFeatures[]>();
  private map!: WebScene;
  view!: SceneView;
  private activeHighlight: __esri.Handle | undefined;
  private configuration!: SystemConfiguration;

  constructor(
    private readonly configService: ConfigurationService,
    private readonly queryService: QueryService,
    private readonly uiBuilder: MapUIBuilderService,
    private readonly eventHandler: MapEventHandlerService,
    private readonly layerFactory: LayerFactoryService) {
  }

  ngOnInit(): void {
    this.initialize().then()
  }

  /**
   * Perform the necessary steps to initialize Arcgis
   * @returns {Promise<void>}
   * @private
   */
  private async initialize(): Promise<void> {
    this.configuration = await this.configService.getConfiguration();
    this.createMap();
    this.createView();
    this.applyConfig();
    await this.uiBuilder.buildUI(this.view);
    this.eventHandler.registerEvents(this.view);
    this.sketchWidget.initialize(this.view)
  }

  /**
   * Create the map with base layers in the RD projection. Because there is no hybrid RD layer we create one by combining a vector tile layer and a tile layer
   * @private
   */
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

  /**
   * Initialise the view by adding it to the dom and configuring it with options
   * @private
   */
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
    const sceneConfig = {
      ...this.configuration.view,
      highlightOptions: {
        color: [255, 255, 0, 1],
        haloColor: 'white',
        haloOpacity: 0.9,
        fillOpacity: 0.2,
        shadowColor: 'black',
        shadowOpacity: 0.5
      } as HighlightStyleOptions,
      clippingArea: extent,
      container: 'map',
      viewingMode: 'local',
      map: this.map,
    } as any
    // Create the view
    this.view = new SceneView(sceneConfig);

    // When a feature is clicked reset the highlight and zoom to the feature
    this.view.on('click', (event) => {
      if (this.activeHighlight) {
        this.activeHighlight.remove();
      }
    });
  }

  /**
   * Get the configuration from the API and create layers based on the configuration, and add them to the map
   * @returns {Promise<void>}
   * @private
   */
  private applyConfig(): void {
    for (const layerConfig of this.configuration.layers) {
      const layer = this.layerFactory.constructLayer(layerConfig)
      if ((layerConfig.type as SystemConfigurationLayerTypes) === 'elevation') {
        this.map.ground.layers.add(layer as ElevationLayer)
        continue;
      }

      if (layer.type !== 'scene') {
        layer.when(() => {
          (layer as FeatureLayer).popupTemplate = createTablePopup(layer as FeatureLayer);
        });
      }

      this.map.layers.add(layer)
    }

    this.map.ground.navigationConstraint = {
      type: 'none',
    };
    this.map.ground.opacity = 0.4;
  }

  /**
   * Zoom and highlight the selected feature
   * @param {__esri.Graphic} graphic
   */
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

  onFeatureGridFilterChange($event: __esri.Graphic[], layer: FeatureLayer | SceneLayer) {
    this.sketchWidget.onExternalFilterChange($event, layer)
  }
}
