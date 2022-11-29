import {Injectable} from '@angular/core';
import {LayerConfig, SystemConfigurationLayerTypes} from '@infra-viewer/interfaces';
import SceneLayer from '@arcgis/core/layers/SceneLayer';
import ElevationLayer from '@arcgis/core/layers/ElevationLayer';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Layer from '@arcgis/core/layers/Layer';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import {HubService} from '../hub/hub.service';
import {createTablePopup} from '../../utils/utils';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import SceneLayerProperties = __esri.SceneLayerProperties;
import ElevationLayerProperties = __esri.ElevationLayerProperties;
import GeoJSONLayerProperties = __esri.GeoJSONLayerProperties;
import FeatureLayerProperties = __esri.FeatureLayerProperties;
import MapImageLayerProperties = __esri.MapImageLayerProperties;

@Injectable({
  providedIn: 'root'
})
export class LayerFactoryService {
  constructors = new Map();

  constructor(private hubService: HubService) {
    this.constructors.set('scene', (layerConfig: LayerConfig) => new SceneLayer(layerConfig as SceneLayerProperties));
    this.constructors.set('elevation', (layerConfig: LayerConfig) => new ElevationLayer(layerConfig as ElevationLayerProperties));
    this.constructors.set('geojson', (layerConfig: LayerConfig) => {
      const layer = new GeoJSONLayer(layerConfig as GeoJSONLayerProperties)
      layer.when(() => layer.popupTemplate = createTablePopup(layer));
      return layer;
    });
    this.constructors.set('feature', (layerConfig: LayerConfig) => {
      const layer = new FeatureLayer(layerConfig as FeatureLayerProperties)
      layer.when(() => layer.popupTemplate = createTablePopup(layer));
      return layer;
    });
    this.constructors.set('map-image', async (layerConfig: LayerConfig) => this.constructMapImageLayer(layerConfig as MapImageLayerProperties));
  }

  async constructLayer(layerConfig: LayerConfig): Promise<Layer> {
    // Create a copy of the layer config
    const layerConfigCopy = {...layerConfig};
    const layerType = layerConfig.type as SystemConfigurationLayerTypes;
    // Remove layer type from config
    delete (layerConfigCopy as any).type;

    const constructedLayer = this.constructors.get(layerType);
    if (!constructedLayer) console.error('Unsupported layer type: ' + layerType)

    return constructedLayer(layerConfigCopy);
  }

  /**
   * Construct a map image layer but in a different way than arcgis does.
   * Arcgis supports sublayers in map-image layers but because map-image servers work with images, 3D renderers are not supported on sublayers.
   * This method will create a group layer with all sublayers (and their sublayers) as children.
   * The children are a feature layer.
   *
   * In the config file, in the sublayers array, you can override configs for each sublayer.
   * The behavior of this array is also a bit different from arcgis, because arcgis only shows the sublayers that are in the array.
   * This method will show all sublayers and override the configs of the sublayers that are in the array.
   * @param {__esri.MapImageLayerProperties} layerConfig
   * @returns {Promise<__esri.Layer>}
   * @private
   */
  private async constructMapImageLayer(layerConfig: __esri.MapImageLayerProperties): Promise<Layer> {
    const parent = new GroupLayer({title: layerConfig.title});
    const serviceInfo = await this.hubService.getServiceInfo(layerConfig.url as string);
    const prefix = layerConfig.title + ' - ';

    for (const sublayer of serviceInfo.layers) {
      const prefixedId = prefix + sublayer.id.toString();
      if (sublayer.type === 'Group Layer') {
        const groupLayer = new GroupLayer({title: sublayer.name, id: prefixedId});
        parent.add(groupLayer);
        continue;
      }

      // Each sublayer has a parent layer id. Find the parent layer and add the sublayer to it
      const sublayerParent = parent.layers.find(layer => layer.id === prefix + sublayer.parentLayerId.toString()) as GroupLayer;
      const parentLayer = sublayerParent || parent;

      // Check if there is a config for this sublayer in the layerConfig.sublayers array
      const sublayerConfigOverride = layerConfig.sublayers?.find(sublayerConfig => sublayer.id.toString() === sublayerConfig.id?.toString());
      const sublayerUrl = `${layerConfig.url}/${sublayer.id}`;

      const sublayerConfig = {
        ...{
          url: sublayerUrl,
          type: 'feature',
          // fields: this.convertFields(sublayerserviceInfo.fields),
          title: sublayer.name,
          visible: false,
        },
        ...sublayerConfigOverride
      }
      const featureLayer = await this.constructLayer(sublayerConfig as any) as FeatureLayer
      parentLayer.add(featureLayer);
    }
    return parent;
  }
}

