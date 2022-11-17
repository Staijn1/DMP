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
import {QueriedFeatures} from '@infra-viewer/interfaces';

@Component({
  selector: 'app-sketch-query-widget',
  templateUrl: './sketch-query-widget.component.html',
  styleUrls: ['./sketch-query-widget.component.scss'],
})
export class SketchQueryWidgetComponent {
  @ViewChild('infoDiv') infoDiv!: ElementRef<HTMLDivElement>
  @Output() query: EventEmitter<QueriedFeatures[]> = new EventEmitter<QueriedFeatures[]>();
  view!: SceneView;
  private sceneLayerViews: SceneLayerView[] = [];
  private featureLayerViews: FeatureLayerView[] = [];
  private queriedFeatures: QueriedFeatures[] = [];
  private sketchViewModel!: __esri.SketchViewModel;
  // Contains the geometry that the user has drawn. This geometry is used to filter the layers
  sketchGeometry: Geometry | null = null;
  // update the filter geometry depending on bufferSize
  filterGeometry: Geometry | null = null;
  sketchLayer: GraphicsLayer = new GraphicsLayer({listMode: 'hide'});
  bufferLayer: GraphicsLayer = new GraphicsLayer({listMode: 'hide'});
  selectedFilter = 'intersects';
  bufferSize = 0;

  private createSketchWidget() {
    this.view.map.addMany([this.bufferLayer, this.sketchLayer]);

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
  updateFilter = () => {
    this.updateFilterGeometry();
    const featureFilter: FeatureFilter = new FeatureFilter({
      // autocasts to FeatureFilter
      geometry: this.filterGeometry as Geometry,
      spatialRelationship: this.selectedFilter
    });
    this.queriedFeatures = [];
    const filterHandler = (layerView: FeatureLayerView | SceneLayerView) => {
      layerView.filter = featureFilter;
    };
    // Apply the filter to the FeatureLayerViews and SceneLayerViews
    this.featureLayerViews.forEach(filterHandler);
    this.sceneLayerViews.forEach(filterHandler)
    // Query the featurelayerViews and sceneLayerViews to get the features that are within the filter
    this.queryFeatures(this.featureLayerViews).then((queriedFeatures) => {
      this.queriedFeatures = this.queriedFeatures.concat(queriedFeatures);
      return this.queryFeatures(this.sceneLayerViews)
    }).then((queriedFeatures) => {
      this.queriedFeatures = this.queriedFeatures.concat(queriedFeatures);
      this.query.emit(this.queriedFeatures);
    });
  }

  updateFilterGeometry() {
    // add a polygon graphic for the bufferSize
    if (this.sketchGeometry) {
      if (this.bufferSize > 0) {
        const bufferGeometry = geometryEngine.geodesicBuffer(this.sketchGeometry, this.bufferSize, 'meters') as Geometry;
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
    this.sceneLayerViews.forEach((layerView: SceneLayerView) => layerView.filter = new FeatureFilter());
    this.featureLayerViews.forEach((layerView: FeatureLayerView) => layerView.filter = new FeatureFilter());
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
  private queryFeatures(layerViews: SceneLayerView[] | FeatureLayerView[]): Promise<QueriedFeatures[]> {
    return Promise.all(layerViews.map(async (layerView: SceneLayerView | FeatureLayerView) => {
      const featureSet = await layerView.queryFeatures();
      return {featureSet, layer: layerView.layer};
    }));
  }
}
