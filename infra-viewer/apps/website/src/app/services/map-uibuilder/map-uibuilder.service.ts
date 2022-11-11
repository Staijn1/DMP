import {Injectable, OnDestroy} from '@angular/core';
import Search from '@arcgis/core/widgets/Search';
import LayerList from '@arcgis/core/widgets/LayerList';
import Expand from '@arcgis/core/widgets/Expand';
import ElevationProfile from '@arcgis/core/widgets/ElevationProfile';
import Daylight from '@arcgis/core/widgets/Daylight';
import ShadowCast from '@arcgis/core/widgets/ShadowCast';
import Legend from '@arcgis/core/widgets/Legend';
import Editor from '@arcgis/core/widgets/Editor';
import Sketch from '@arcgis/core/widgets/Sketch';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import WebScene from '@arcgis/core/WebScene';
import LayerView from '@arcgis/core/views/layers/LayerView';
import Slider from '@arcgis/core/widgets/Slider';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';

@Injectable({
  providedIn: 'root'
})
export class MapUIBuilderService implements OnDestroy {
  private searchWidget!: __esri.widgetsSearch;
  public legend!: __esri.Legend;


  async buildUI(view: __esri.SceneView): Promise<void> {
    const layersToViewInLegend = view.map.layers.filter(layer => layer.type !== 'group' && layer.type !== 'elevation').map((layer) => {
      return {
        layer: layer,
      }
    });

    this.legend = new Legend({
        view: view
      }
    );
    this.legend.layerInfos.push(...layersToViewInLegend);
    const legendExpand = new Expand({
      view: view,
      content: this.legend
    });

    this.searchWidget = new Search({
      view: view,
      container: document.createElement('div'),
    });

    const layerList = new LayerList({
      view: view,
    });

    const layerlistExpand = new Expand({
      view: view,
      content: layerList,
    });

    const elevationProfile = new ElevationProfile({
      view: view,
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
      view: view,
      content: elevationProfile,
    });

    const daylightExpand = new Expand({
      view: view,
      content: new Daylight({
        view: view
      }),
      group: 'top-right'
    });

    const shadowWidget = new Expand({view: view, content: new ShadowCast({view: view}), group: 'top-right'});
    (shadowWidget.content as ShadowCast).viewModel.stop();
    shadowWidget.watch('expanded', (expanded) => {
      if (expanded) {
        (shadowWidget.content as ShadowCast).viewModel.start();
      } else {
        (shadowWidget.content as ShadowCast).viewModel.stop();
      }
    });

    const editor = await this.createEditorWidget(view);
    // const sketchExpand = this.createSketchWidget(view);

    view.ui.add([legendExpand], 'bottom-right');
    view.ui.add([elevationProfileExpand, layerlistExpand], 'top-left');
    view.ui.add([this.searchWidget, daylightExpand, shadowWidget, editor], 'top-right');
  }

  /**
   * Create a widget to edit features.
   * Disable editing for all layers, even if they are marked as editable, except for the layers that have an id that starts with 'editable'
   * @param {__esri.SceneView} view
   * @returns {__esri.Expand | __esri.Expand}
   * @private
   */
  private async createEditorWidget(view: __esri.SceneView) {
    const layerInfos = view.map.layers.map((layer) => {
      const editable = layer.id.startsWith('editable');
      return {
        layer: layer,
        addEnabled: editable,
      }
    });

    return new Expand({
      view: view,
      group: 'editor',
      content: new Editor({
        view: view,
        layerInfos: layerInfos as any,
      })
    });
  }

  /**
   * Add the ability to search for features in a layer
   * @param {__esri.SearchSource} source
   */
  addSearch(source: __esri.SearchSource): void {
    this.searchWidget.sources.add(source);
  }

  ngOnDestroy(): void {
    this.searchWidget.destroy();
  }
}
