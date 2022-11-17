import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import WebScene from '@arcgis/core/WebScene';
import LayerView from '@arcgis/core/views/layers/LayerView';
import FeatureLayerView from '@arcgis/core/views/layers/FeatureLayerView';
import SceneLayerView from '@arcgis/core/views/layers/SceneLayerView';
import Slider from '@arcgis/core/widgets/Slider';
import Geometry from '@arcgis/core/geometry/Geometry';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import FeatureFilter from '@arcgis/core/layers/support/FeatureFilter';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Graphic from '@arcgis/core/Graphic';
import Expand from '@arcgis/core/widgets/Expand';
import SceneView from '@arcgis/core/views/SceneView';
import {QueriedFeatures, SpatialRelationship} from '@infra-viewer/interfaces';
import FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import Query from '@arcgis/core/rest/support/Query';

@Component({
  selector: 'app-sketch-query-widget',
  templateUrl: './sketch-query-widget.component.html',
  styleUrls: ['./sketch-query-widget.component.scss'],
})
export class SketchQueryWidgetComponent {
  @ViewChild('infoDiv') infoDiv!: ElementRef<HTMLDivElement>
  @Output() query: EventEmitter<QueriedFeatures[]> = new EventEmitter<QueriedFeatures[]>();
  private layerViews: (FeatureLayerView | SceneLayerView)[] = [];
  private queriedFeatures: QueriedFeatures[] = [];
  private sketchViewModel!: __esri.SketchViewModel;
  private featureFilter: __esri.FeatureFilter = new FeatureFilter();

  view!: SceneView;
  // Contains the geometry that the user has drawn. This geometry is used to filter the layers
  sketchGeometry: Geometry | null = null;
  // update the filter geometry depending on bufferSize
  filterGeometry: Geometry | null = null;
  sketchLayer: GraphicsLayer = new GraphicsLayer({listMode: 'hide'});
  bufferLayer: GraphicsLayer = new GraphicsLayer({listMode: 'hide'});
  selectedSpatialRelationship: SpatialRelationship = 'intersects';
  bufferSize = 0;
  spatialRelationships = ['intersects', 'contains'];

  private createSketchWidget() {
    this.view.map.addMany([this.bufferLayer, this.sketchLayer]);

    // create the layerView's to add the filter
    (this.view.map as WebScene).load().then(() => {
      // loop through the map scene and feature layers and add them to the layerViews array
      this.view.map.layers.filter(layer => ['scene', 'feature'].includes(layer.type)).forEach((layer) => {
        this.view
          .whenLayerView(layer)
          .then((layerView: LayerView) => {
            this.layerViews.push(layerView as FeatureLayerView | SceneLayerView);
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


    const bufferVariablesChanged = (event: any) => {
      this.bufferSize = event.value;
      this.updateFilter();
    }
    bufferNumSlider.on('thumb-change', bufferVariablesChanged);
    bufferNumSlider.on('thumb-drag', bufferVariablesChanged);


    this.sketchViewModel = new SketchViewModel({
      layer: this.sketchLayer,
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
              color: [255, 255, 255, 0.4]
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

    this.sketchViewModel.on('create', (event) => {
      // update the filter every time the user finishes drawing the filtergeometry
      if (event.state == 'complete') {
        this.sketchGeometry = event.graphic.geometry;
        this.updateFilter();
      }
    });

    this.sketchViewModel.on('update', (event) => {
      const eventInfo = event.toolEventInfo;
      // update the filter every time the user moves the filtergeometry
      if (eventInfo && eventInfo.type.includes('stop')) {
        this.sketchGeometry = event.graphics[0].geometry;
        this.updateFilter();
      }
    });

    const expand = new Expand({
      expandIconClass: 'esri-icon-filter',
      expandTooltip: 'Filter',
      view: this.view,
      content: this.infoDiv.nativeElement
    });
    this.view.ui.add(expand, 'top-right');
    this.infoDiv.nativeElement.style.display = 'block';
  }

  /**
   * Performs the necessary steps to initialize this component.
   * We cannot use ngOnInit because it fires before the view is loaded with the correct configuration (in the parent)
   * This function is therefore directly called from the parent component
   */
  initialize(view: __esri.SceneView) {
    this.view = view;
    this.createSketchWidget();
  }

  /**
   * Set the geometry filter on the visible FeatureLayerView
   */
  updateFilter() {
    this.layerViews.forEach((layerView) => layerView.layer.visible = true)
    this.updateFilterGeometry();

    this.featureFilter = new FeatureFilter({
      // autocasts to FeatureFilter
      geometry: this.filterGeometry as Geometry,
      spatialRelationship: this.selectedSpatialRelationship
    });
    // Reset the queriedFeatures array otherwise the old features will still be in the list, but they might be outside the filter
    this.queriedFeatures = [];

    // Apply filter for all layerviews
    this.applyFilterForAllLayers(this.layerViews);

    // Now query the layer views to get the features that are within the filter
    this.queryFeatures(this.layerViews).then((queriedFeatures) => {
      this.queriedFeatures = this.queriedFeatures.concat(queriedFeatures);
      // We have collected all the features that are within the filter, now we can emit them to notify other components
      this.query.emit(this.queriedFeatures);
    });
  }

  /**
   * If the user is using the buffer tool, we need to create a buffer around the sketchGeometry
   * This buffer is then used as the filterGeometry
   * If the user is not using the buffer tool, we just use the sketchGeometry as the filterGeometry,
   */
  updateFilterGeometry() {
    // add a polygon graphic for the bufferSize
    if (this.sketchGeometry) {
      if (this.bufferSize > 0) {
        const bufferGeometry = geometryEngine.buffer(this.sketchGeometry, this.bufferSize, 'meters') as Geometry;
        if (this.bufferLayer.graphics.length === 0) {
          this.bufferLayer.add(
            new Graphic({
              geometry: bufferGeometry,
              symbol: this.sketchViewModel.polygonSymbol
            })
          );
        } else {
          this.bufferLayer.graphics.getItemAt(0).geometry = bufferGeometry;
        }
        this.filterGeometry = bufferGeometry;
      } else {
        this.bufferLayer.removeAll();
        this.filterGeometry = this.sketchGeometry;
      }
    }
  }

  /**
   * Remove the filter
   */
  clearFilter() {
    this.sketchGeometry = null;
    this.filterGeometry = null;
    this.sketchLayer.removeAll();
    this.bufferLayer.removeAll();
    this.queriedFeatures = [];
    this.query.emit(this.queriedFeatures);
    this.featureFilter = new FeatureFilter();
    this.applyFilterForAllLayers(this.layerViews);
  }

  /**
   * When clicking on one of the draw geometry buttons this function is fired
   * @param event
   */
  geometryButtonsClickHandler(event: MouseEvent) {
    const geometryType = (event.target as HTMLButtonElement).value;
    this.clearFilter();
    this.sketchViewModel.create(geometryType as any);
  }

  /**
   * Query all the features that are within the filter that is active
   * @param {__esri.SceneLayerView[] | __esri.FeatureLayerView[]} layerViews
   * @private
   */
  private queryFeatures(layerViews: (__esri.FeatureLayerView | __esri.SceneLayerView)[]): Promise<QueriedFeatures[]> {
    return Promise.all(layerViews.map(async (layerView: SceneLayerView | FeatureLayerView) => {
      try {
        // Build a new query based on the current filter
        const query = new Query({
          spatialRelationship: this.featureFilter.spatialRelationship as SpatialRelationship,
          geometry: this.featureFilter.geometry,
          outFields: ['*'],
        });
        // If the layerviews are sceneLayerViews, we need to use the queryFeatures method on the layerView
        // Otherwise, we will query the server which cannot be done on scene layers without an associated feature layer
        let featureSet;
        if (layerView.layer.type === 'scene') {
          featureSet = await layerView.queryFeatures(query);
        } else {
          featureSet = await layerView.layer.queryFeatures(query);
        }
        return {featureSet, layer: layerView.layer};
      } catch (e) {
        console.error(`Query failed for layer: ${layerView.layer.title} id: ${layerView.layer.id}`, e);
        return {featureSet: new FeatureSet(), layer: layerView.layer};
      }
    }));
  }

  /**
   * A helper function to apply the current featureFilter to all layerViews
   * @param {__esri.FeatureLayerView[] | __esri.SceneLayerView[]} layerViews
   * @private
   */
  private applyFilterForAllLayers(layerViews: (__esri.FeatureLayerView | __esri.SceneLayerView)[]) {
    layerViews.forEach((layerView: FeatureLayerView | SceneLayerView) => layerView.filter = this.featureFilter);
  }

  /**
   * When the user changes the filter outside this component, we need to update our view so the filter matches.
   * @param {__esri.Graphic[]} graphics - The graphics that match the new filter
   * @param {__esri.Layer} layer - The layer that was filtered
   */
  onExternalFilterChange(graphics: __esri.Graphic[], layer: __esri.FeatureLayer | __esri.SceneLayer) {
    // Find the layerview that matches the layer that was filtered
    const layerView = this.layerViews.find((layerView) => layerView.layer.id === layer.id);
    if (layerView) {
      // Change the filter to only show the graphics that are in the graphics array
      layerView.filter = new FeatureFilter({
        objectIds: graphics.map((graphic) => graphic.attributes[layer.objectIdField])
      });
    }
  }
}
