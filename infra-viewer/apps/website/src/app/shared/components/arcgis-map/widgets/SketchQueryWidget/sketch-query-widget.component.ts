import {Component, ElementRef, ViewChild} from '@angular/core';
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

@Component({
  selector: 'app-sketch-query-widget',
  templateUrl: './sketch-query-widget.component.html',
  styleUrls: ['./sketch-query-widget.component.scss'],
})
export class SketchQueryWidgetComponent {
  view!: SceneView;
  @ViewChild('infoDiv') infoDiv!: ElementRef<HTMLDivElement>
  private sceneLayerViews: SceneLayerView[] = [];
  private featureLayerViews: FeatureLayerView[] = [];
  // Contains the geometry that the user has drawn. This geometry is used to filter the layers
  sketchGeometry: Geometry | null = null;
  // update the filter geometry depending on bufferSize
  filterGeometry: Geometry | null = null;
  sketchLayer: GraphicsLayer = new GraphicsLayer({listMode: 'hide'});
  bufferLayer: GraphicsLayer = new GraphicsLayer({listMode: 'hide'});
  private sketchViewModel!: __esri.SketchViewModel;
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

    const geometryButtonsClickHandler = (event: any) => {
      const geometryType = event.target.value;
      this.clearFilter();
      this.sketchViewModel.create(geometryType);
    }
    // draw geometry buttons - use the selected geometry to sktech
    if (document) {
      (document.getElementById('point-geometry-button') as HTMLElement).onclick = geometryButtonsClickHandler;
      (document.getElementById('line-geometry-button') as HTMLElement).onclick = geometryButtonsClickHandler;
      (document.getElementById('polygon-geometry-button') as HTMLElement).onclick = geometryButtonsClickHandler;
    }

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

    if (this.featureLayerViews.length > 0) {
      this.featureLayerViews.forEach((layerView: FeatureLayerView) => layerView.filter = featureFilter);
    }
    if (this.sceneLayerViews.length > 0) {
      this.sceneLayerViews.forEach((layerView: SceneLayerView) => layerView.filter = featureFilter);
    }
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
    if (this.sceneLayerViews.length > 0) this.sceneLayerViews.forEach((layerView: SceneLayerView) => layerView.filter = new FeatureFilter());
    if (this.featureLayerViews.length > 0) this.featureLayerViews.forEach((layerView: FeatureLayerView) => layerView.filter = new FeatureFilter());
  }
}
