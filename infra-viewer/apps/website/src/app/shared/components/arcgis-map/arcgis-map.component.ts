import {Component, OnInit} from '@angular/core';
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
import {SystemConfiguration, SystemConfigurationLayerTypes} from '@infra-viewer/interfaces';
import {LayerFactoryService} from '../../../services/layer-factory/layer-factory.service';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Slider from '@arcgis/core/widgets/Slider';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import LayerView from '@arcgis/core/views/layers/LayerView';
import Geometry from '@arcgis/core/geometry/Geometry';
import SceneLayerView from '@arcgis/core/views/layers/SceneLayerView';
import FeatureFilter from '@arcgis/core/layers/support/FeatureFilter';
import Graphic from '@arcgis/core/Graphic';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';

@Component({
  selector: 'app-arcgis-map',
  templateUrl: './arcgis-map.component.html',
  styleUrls: ['./arcgis-map.component.scss'],
})
export class ArcgisMapComponent implements OnInit {
  private map!: WebScene;
  view!: SceneView;
  private activeHighlight: __esri.Handle | undefined;
  private configuration!: SystemConfiguration;
  private sceneLayerViews: SceneLayerView[] = [];
  private featureLayerViews: FeatureLayerView[] = [];


  constructor(
    private readonly configService: ConfigurationService,
    private readonly queryService: QueryService,
    private readonly uiBuilder: MapUIBuilderService,
    private readonly eventHandler: MapEventHandlerService,
    private readonly layerFactory: LayerFactoryService) {
  }

  ngOnInit(): void {
    this.configService.getConfiguration().then((config) => {
      this.configuration = config
      this.createMap()
      this.createView();
      this.applyConfig();
      this.createSketchWidget();
    }).then(() => this.uiBuilder.buildUI(this.view)).then(() => this.eventHandler.registerEvents(this.view));
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

  private createSketchWidget() {
    // add a GraphicsLayer for the sketches and the buffer
    const sketchLayer = new GraphicsLayer();
    const bufferLayer = new GraphicsLayer();
    this.view.map.addMany([bufferLayer, sketchLayer]);

    // create the layerView's to add the filter
    (this.view.map as WebScene).load().then(() => {
      // loop through webmap's operational layers
      this.view.map.layers.forEach((layer, index) => {
        this.view
          .whenLayerView(layer)
          .then((layerView: LayerView) => {
            if (layer.type === 'feature') {
              this.featureLayerViews.push(layerView as FeatureLayerView);
            }
            if (layer.type === 'scene') {
              this.sceneLayerViews.push(layerView as SceneLayerView);
            }
          })
          .catch(console.error);
      });
    });

    const bufferNumSlider = new Slider({
      container: 'bufferNum',
      min: 0,
      max: 1000,
      steps: 1,
      visibleElements: {
        labels: true,
      },
      precision: 0,
      labelFormatFunction: (value, type) => {
        return `${value.toString()}m`;
      },
      values: [0]
    });

    let bufferSize = 0;
    bufferNumSlider.on('thumb-change', bufferVariablesChanged);
    bufferNumSlider.on('thumb-drag', bufferVariablesChanged);

    function bufferVariablesChanged(event: any) {
      bufferSize = event.value;
      updateFilter();
    }

    // use SketchViewModel to draw polygons that are used as a filter
    let sketchGeometry: Geometry | null = null;
    const sketchViewModel = new SketchViewModel({
      layer: sketchLayer,
      view: this.view,
      pointSymbol: {
        type: 'simple-marker',
        style: 'circle',
        size: 10,
        color: [255, 255, 255, 0.8],
        outline: {
          color: [211, 132, 80, 0.7],
          size: 10
        } as any
      },
      polylineSymbol: {
        type: 'simple-line',
        color: [211, 132, 80, 0.7],
        width: 6
      },
      polygonSymbol: {
        type: 'polygon-3d',
        symbolLayers: [
          {
            type: 'fill',
            material: {
              color: [255, 255, 255, 0.8]
            },
            outline: {
              color: [211, 132, 80, 0.7],
              size: '10px'
            }
          }
        ]
      },
      defaultCreateOptions: {hasZ: false}
    });

    sketchViewModel.on('create', (event) => {
      // update the filter every time the user finishes drawing the filtergeometry
      if (event.state == 'complete') {
        sketchGeometry = event.graphic.geometry;
        updateFilter();
      }
    });

    sketchViewModel.on('update', (event) => {
      const eventInfo = event.toolEventInfo;
      // update the filter every time the user moves the filtergeometry
      if (event.toolEventInfo && event.toolEventInfo.type.includes('stop')) {
        sketchGeometry = event.graphics[0].geometry;
        updateFilter();
      }
    });

    // draw geometry buttons - use the selected geometry to sktech
    if (document) {
      (document.getElementById('point-geometry-button') as HTMLElement).onclick = geometryButtonsClickHandler;
      (document.getElementById('line-geometry-button') as HTMLElement).onclick = geometryButtonsClickHandler;
      (document.getElementById('polygon-geometry-button') as HTMLElement).onclick = geometryButtonsClickHandler;
    }

    function geometryButtonsClickHandler(event: any) {
      const geometryType = event.target.value;
      clearFilter();
      sketchViewModel.create(geometryType);
    }

    // get the selected spatialRelationship
    let selectedFilter = 'disjoint';
    (document.getElementById('relationship-select') as any).addEventListener('change', (event: any) => {
      const select = event.target;
      selectedFilter = select.options[select.selectedIndex].value;
      console.log('selectedFilter', selectedFilter);
      updateFilter();
    });

    const clearFilter = () => {
      sketchGeometry = null;
      filterGeometry = null;
      sketchLayer.removeAll();
      bufferLayer.removeAll();
      if (this.sceneLayerViews.length > 0) this.sceneLayerViews.forEach((layerView: SceneLayerView) => layerView.filter = new FeatureFilter());
      if (this.featureLayerViews.length > 0) this.featureLayerViews.forEach((layerView: FeatureLayerView) => layerView.filter = new FeatureFilter());
    }

    // remove the filter
    (document.getElementById('clearFilter') as HTMLElement).addEventListener('click', clearFilter);


    // set the geometry filter on the visible FeatureLayerView
    const updateFilter = () => {
      updateFilterGeometry();
      const featureFilter: FeatureFilter = new FeatureFilter({
        // autocasts to FeatureFilter
        geometry: filterGeometry as Geometry,
        spatialRelationship: selectedFilter
      });

      if (this.featureLayerViews.length > 0) {
        this.featureLayerViews.forEach((layerView: FeatureLayerView) => layerView.filter = featureFilter);
      }
      if (this.sceneLayerViews.length > 0) {
        this.sceneLayerViews.forEach((layerView: SceneLayerView) => layerView.filter = featureFilter);
      }
    }

    // update the filter geometry depending on bufferSize
    let filterGeometry: Geometry | null = null;

    function updateFilterGeometry() {
      // add a polygon graphic for the bufferSize
      if (sketchGeometry) {
        if (bufferSize > 0) {
          const bufferGeometry = geometryEngine.geodesicBuffer(sketchGeometry, bufferSize, 'meters') as Geometry;
          if (bufferLayer.graphics.length === 0) {
            bufferLayer.add(
              new Graphic({
                geometry: bufferGeometry,
                symbol: sketchViewModel.polygonSymbol
              })
            );
          } else {
            bufferLayer.graphics.getItemAt(0).geometry = bufferGeometry;
          }
          filterGeometry = bufferGeometry;
        } else {
          bufferLayer.removeAll();
          filterGeometry = sketchGeometry;
        }
      }
    }

    (document.getElementById('infoDiv') as HTMLDivElement).style.display = 'block';
  }
}
