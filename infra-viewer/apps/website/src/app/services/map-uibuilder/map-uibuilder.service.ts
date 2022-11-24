import {Injectable, OnDestroy} from '@angular/core';
import Search from '@arcgis/core/widgets/Search';
import LayerList from '@arcgis/core/widgets/LayerList';
import Expand from '@arcgis/core/widgets/Expand';
import ElevationProfile from '@arcgis/core/widgets/ElevationProfile';
import Daylight from '@arcgis/core/widgets/Daylight';
import ShadowCast from '@arcgis/core/widgets/ShadowCast';
import Legend from '@arcgis/core/widgets/Legend';
import Editor from '@arcgis/core/widgets/Editor';
import CoordinateConversion from '@arcgis/core/widgets/CoordinateConversion';
import {environment} from '../../../environments/environment';
import AreaMeasurement3D from '@arcgis/core/widgets/AreaMeasurement3D';
import DirectLineMeasurement3D from '@arcgis/core/widgets/DirectLineMeasurement3D';
import Fullscreen from '@arcgis/core/widgets/Fullscreen';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import SceneLayer from '@arcgis/core/layers/SceneLayer';
import ElevationLayer from '@arcgis/core/layers/ElevationLayer';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';

@Injectable({
  providedIn: 'root'
})
export class MapUIBuilderService implements OnDestroy {
  private searchWidget!: __esri.widgetsSearch;


  async buildUI(view: __esri.SceneView): Promise<void> {
    // this.legend.layerInfos.push(...layersToViewInLegend);
    const legendExpand = new Expand({
      view: view,
      expandTooltip: 'Show legend',
      collapseTooltip: 'Hide legend',
      content: new Legend({
        view: view
      })
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
      expandTooltip: 'Show layer list',
      collapseTooltip: 'Hide layer list',
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
      expandTooltip: 'Show elevation profile',
      collapseTooltip: 'Hide elevation profile',
      content: elevationProfile,
    });

    const daylightExpand = new Expand({
      view: view,
      expandTooltip: 'Show time of day',
      collapseTooltip: 'Hide time of day',
      content: new Daylight({
        view: view
      }),
      group: 'top-right'
    });

    const shadowWidget = new Expand({
      view: view,
      content: new ShadowCast({view: view}),
      group: 'top-right',
      expandTooltip: 'Show shadow cast',
      collapseTooltip: 'Hide shadow cast',
    });
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

    const areaMeasurement = new Expand({
      view: view,
      expandTooltip: 'Show area measurement',
      collapseTooltip: 'Hide area measurement',
      content: new AreaMeasurement3D({
        view: view,
      }),
      group: 'top-right'
    });

    const directLineMeasurement = new Expand({
      view: view,
      expandTooltip: 'Show direct line measurement',
      collapseTooltip: 'Hide direct line measurement',
      content: new DirectLineMeasurement3D({
        view: view,
      }),
      group: 'top-right'
    });
    const fullScreen = new Fullscreen({
      view: view
    });
    // If in development mode, add the coordinate conversion widget
    if (!environment.production) {
      const coordinateConversion = new Expand({
        view: view,
        content: new CoordinateConversion({
          view: view
        }),
        group: 'bottom-left'
      });
      view.ui.add(coordinateConversion, 'bottom-left');
    }
    view.ui.add([legendExpand, fullScreen], 'bottom-right');
    view.ui.add([elevationProfileExpand, layerlistExpand], 'top-left');
    view.ui.add([this.searchWidget, daylightExpand, shadowWidget, editor, directLineMeasurement, areaMeasurement], 'top-right');
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
      expandTooltip: 'Show editor',
      collapseTooltip: 'Hide editor',
      content: new Editor({
        view: view,
        layerInfos: layerInfos as any,
      })
    });
  }

  ngOnDestroy(): void {
    this.searchWidget.destroy();
  }
}
