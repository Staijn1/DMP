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
import {SystemConfigurationLayerTypes} from '@infra-viewer/interfaces';
import {LayerFactoryService} from '../../../services/layer-factory/layer-factory.service';
import Point from '@arcgis/core/geometry/Point';
import Mesh from '@arcgis/core/geometry/Mesh';
import Graphic from '@arcgis/core/Graphic';
import MeshSymbol3DConstructor = __esri.MeshSymbol3DConstructor;
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SceneLayer from '@arcgis/core/layers/SceneLayer';
import Editor from '@arcgis/core/widgets/Editor';

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
    private readonly eventHandler: MapEventHandlerService,
    private readonly layerFactory: LayerFactoryService) {
  }

  ngOnInit(): void {
    this.createMap()
    this.createView();
    this.uiBuilder.buildUI(this.view);
    this.applyConfig().then();
    this.eventHandler.registerEvents(this.view);
    this.createMeshes()
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

    for (const layerConfig of config.layers) {
      const layer = this.layerFactory.constructLayer(layerConfig)
      if ((layerConfig.type as SystemConfigurationLayerTypes) === 'elevation') {
        this.map.ground.layers.add(layer as ElevationLayer)
      }

      if (layer.type !== 'scene') {
        this.uiBuilder.addLayerToLegend(layer);
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

  /**
   * Load the meshes and add them to the map.
   * @private
   */
  private createMeshes() {
    this.view.on('immediate-click', (event) => {
      this.view.hitTest(event).then((response) => {
        if (response.results.length > 0) {
          // Log the coordinates of the items that were clicked
          response.results.forEach((result) => {
            console.log(result.layer.title, result.mapPoint.toJSON());
          });
        }
      });
    });
    const location = new Point({
      x: 190928.50230067183, y: 443549.0011246043, z: 23.620267403533955,
      spatialReference: {
        wkid: 28992
      }
    });
    const gltfURL = '../../../assets/3d-models/eusebiuskerk/eusebius.gltf';
    Mesh.createFromGLTF(location, gltfURL)
      .then((geometry) => {
        // add it to a graphic
        const graphic = new Graphic({
          geometry: geometry,
          symbol: {
            type: 'mesh-3d', // autocasts as new MeshSymbol3D()
            symbolLayers: [{
              type: 'fill', // autocasts as new FillSymbol3DLayer()
              material: {
                color: [255, 255, 255, 1],
                colorMixMode: 'tint'
              }
            }]
          } as any
        });
        this.view.graphics.add(graphic);
      })
      .catch(console.error);

    const editor = new Editor({
      view: this.view,
    });
    this.view.ui.add(editor, 'top-right');
  }
}
