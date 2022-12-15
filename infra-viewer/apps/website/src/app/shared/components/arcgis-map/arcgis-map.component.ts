import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import WebScene from "@arcgis/core/WebScene";
import SceneView from "@arcgis/core/views/SceneView";
import { ConfigurationService } from "../../../services/configuration/configuration.service";
import ElevationLayer from "@arcgis/core/layers/ElevationLayer";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { MapUIBuilderService } from "../../../services/map-uibuilder/map-uibuilder.service";
import { MapEventHandlerService } from "../../../services/map-event-handler/map-event-handler.service";
import Basemap from "@arcgis/core/Basemap";
import TileLayer from "@arcgis/core/layers/TileLayer";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer";
import FeatureLayerView from "@arcgis/core/views/layers/FeatureLayerView";
import { HighlightStyleOptions } from "ag-grid-community";
import { QueriedFeatures, SystemConfiguration, SystemConfigurationLayerTypes } from "@infra-viewer/interfaces";
import { LayerFactoryService } from "../../../services/layer-factory/layer-factory.service";
import { SketchQueryWidgetComponent } from "./widgets/SketchQueryWidget/sketch-query-widget.component";
import SceneLayer from "@arcgis/core/layers/SceneLayer";
import { StorageService } from "../../../services/storage/storage.service";
import CameraProperties = __esri.CameraProperties;

@Component({
  selector: "app-arcgis-map",
  templateUrl: "./arcgis-map.component.html",
  styleUrls: ["./arcgis-map.component.scss"]
})
export class ArcgisMapComponent implements OnInit {
  @ViewChild(SketchQueryWidgetComponent) private sketchWidget!: SketchQueryWidgetComponent;
  @ViewChild("measurementWidgetsContainer") private measurementWidgetsContainer!: ElementRef<HTMLDivElement>;
  @ViewChild("distanceMeasurement") private distanceMeasurement!: ElementRef<HTMLDivElement>;
  @ViewChild("surfaceMeasurement") private surfaceMeasurement!: ElementRef<HTMLDivElement>;
  @Output() query: EventEmitter<QueriedFeatures[]> = new EventEmitter<QueriedFeatures[]>();

  private map!: WebScene;
  view!: SceneView;
  private activeHighlight: __esri.Handle | undefined;
  private configuration!: SystemConfiguration;
  private readonly cinameticModeEnabled = false;

  constructor(
    private readonly configService: ConfigurationService,
    private readonly uiBuilder: MapUIBuilderService,
    private readonly eventHandler: MapEventHandlerService,
    private readonly storageService: StorageService,
    private readonly layerFactory: LayerFactoryService) {
  }

  ngOnInit(): void {
    this.initialize().then();
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
    await this.applyConfig();
    await this.uiBuilder.buildUI(this.view, this.measurementWidgetsContainer, this.distanceMeasurement, this.surfaceMeasurement);
    this.eventHandler.registerEvents(this.view);
    this.sketchWidget.initialize(this.view);

    if (this.cinameticModeEnabled) {
      this.cinematicMode().then();
    }
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
            url: "https://services.arcgisonline.nl/arcgis/rest/services/Luchtfoto/Luchtfoto/MapServer"
          }),
          new VectorTileLayer({
            url: "https://tiles.arcgis.com/tiles/nSZVuSZjHpEZZbRo/arcgis/rest/services/OSM_RD/VectorTileServer",
            blendMode: "multiply"
          })
        ]
      }),
      layers: []
    });
  }

  /**
   * Initialise the view by adding it to the dom and configuring it with options
   * @private
   */
  private createView(): void {
    // Get the camera object if it exists. If it does not exist, use the camera configuration in the systemconfig.
    const cameraInStorage = this.storageService.get("camera");
    const camera = cameraInStorage || this.configuration.view.camera;

    const extent = {
      // autocasts as new Extent()
      xmin: 151575.98477672008,
      ymin: 433495.6075078908,
      xmax: 232549.08692756083,
      ymax: 453749.52060500067,
      spatialReference: {
        wkid: 28992
      }
    };
    const sceneConfig = {
      ...this.configuration.view,
      highlightOptions: {
        color: [255, 255, 0, 1],
        haloColor: "white",
        haloOpacity: 0.9,
        fillOpacity: 0.2,
        shadowColor: "black",
        shadowOpacity: 0.5
      } as HighlightStyleOptions,
      clippingArea: extent,
      container: "map",
      viewingMode: "local",
      map: this.map,
      camera: camera
    } as any;
    // Create the view
    this.view = new SceneView(sceneConfig);
    // When a feature is clicked reset the highlight and zoom to the feature
    this.view.on("click", (event) => {
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
  private async applyConfig(): Promise<void> {
    for (const layerConfig of this.configuration.layers) {
      const layer = await this.layerFactory.constructLayer(layerConfig);
      if ((layerConfig.type as SystemConfigurationLayerTypes) === "elevation") {
        this.map.ground.layers.add(layer as ElevationLayer);
        continue;
      }

      this.map.layers.add(layer);
    }

    this.map.ground.navigationConstraint = {
      type: "none"
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
    this.sketchWidget.onExternalFilterChange($event, layer);
  }

  clearMeasurements(type: "distance" | "surface") {
    this.uiBuilder.clearMeasurements(type);
  }

  private async cinematicMode(skipInitialWait: boolean = false) {
    if (!skipInitialWait) {
      await this.wait(20000);
    }

    const uiContainer = document.querySelector(".esri-ui-inner-container") as HTMLDivElement | undefined;
    if (uiContainer) {
      uiContainer.style.display = "none";
    }
    console.log("Starting cinematic mode");
    const eusebius: CameraProperties = {
      "position": {
        "spatialReference": { "wkid": 28992 },
        "x": 190694.90339843076,
        "y": 443397.527196996,
        "z": 172.3932711050524
      }, "heading": 60.26799807531214, "tilt": 63.7174352189767
    };
    await this.view.goTo(eusebius);

    await this.wait(5000);

    let timestarted = Date.now();
    const eusebiusRotationDuration = 40000;
    await this.rotateCamera(timestarted, eusebiusRotationDuration);
    await this.wait(eusebiusRotationDuration);
    await this.wait(5000);

    const interestingSewersLocation: CameraProperties = {
      "position": {
        "spatialReference": {
          "wkid": 28992
        }, "x": 191035.2442261865, "y": 443277.2018920018, "z": -31.78619729480218
      }, "heading": 90.9002494681998, "tilt": 150.34554259609135
    };
    await this.view.goTo(interestingSewersLocation);
    await this.wait(7000);
    const sewerRotation = 30000;
    timestarted = Date.now();
    await this.rotateCamera(timestarted, sewerRotation, "y", -0.5);
    await this.wait(sewerRotation);
    console.log("Done animating");
  }

  private async rotateCamera(timeStarted: number, duration: number, direction: "x" | "y" = "x", speed: number = 0.5) {
    const timeElapsed = Date.now() - timeStarted;
    if (timeElapsed >= duration) return;

    let heading = this.view.camera.heading;
    let tilt = this.view.camera.tilt;
    if (direction === "x") {
      heading += speed;
    }
    if (direction === "y") {
      if (tilt >= 179) {
        speed = -speed;
      }
      tilt += speed;
    }

    if (!this.view.interacting) {
      await this.view.goTo({
        heading: heading,
        tilt: tilt,
        center: this.view.center
      }, { animate: false });
      requestAnimationFrame(() => {
        this.rotateCamera(timeStarted, duration, direction, speed);
      });
    }
  }

  private wait(milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  onKeyDown($event: KeyboardEvent) {
    switch ($event.code) {
      case"KeyF":
        this.uiBuilder.toggleFullscreen();
        break;
      case"KeyP":
        this.cinematicMode(true).then();
        break;
      default:
        console.log("Ignoring key press", $event.code);
    }
  }
}
