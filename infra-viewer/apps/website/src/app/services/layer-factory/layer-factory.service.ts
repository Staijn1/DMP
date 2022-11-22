import {Injectable} from '@angular/core';
import {LayerConfig, SystemConfigurationLayerTypes} from '@infra-viewer/interfaces';
import SceneLayer from '@arcgis/core/layers/SceneLayer';
import ElevationLayer from '@arcgis/core/layers/ElevationLayer';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Layer from '@arcgis/core/layers/Layer';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import {HubService} from '../hub/hub.service';
import SceneLayerProperties = __esri.SceneLayerProperties;
import ElevationLayerProperties = __esri.ElevationLayerProperties;
import GeoJSONLayerProperties = __esri.GeoJSONLayerProperties;
import FeatureLayerProperties = __esri.FeatureLayerProperties;

@Injectable({
  providedIn: 'root'
})
export class LayerFactoryService {
  constructors = new Map();

  constructor(private hubService: HubService) {
    this.constructors.set('scene', (layerConfig: LayerConfig) => new SceneLayer(layerConfig as SceneLayerProperties));
    this.constructors.set('elevation', (layerConfig: LayerConfig) => new ElevationLayer(layerConfig as ElevationLayerProperties));
    this.constructors.set('geojson', (layerConfig: LayerConfig) => new GeoJSONLayer(layerConfig as GeoJSONLayerProperties));
    this.constructors.set('feature', (layerConfig: LayerConfig) => new FeatureLayer(layerConfig as FeatureLayerProperties));
    this.constructors.set('map-image', async (layerConfig: LayerConfig) => this.constructGroupLayer(layerConfig));
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

  private async constructGroupLayer(layerConfig: __esri.MapImageLayerProperties): Promise<Layer> {
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
      if (!sublayerParent) {
        console.error('Could not find parent layer for sublayer: ' + sublayer.name);
        continue;
      }
      sublayerParent.add(this.constructLayer({
        title: sublayer.name,
        url: layerConfig.url + '/' + sublayer.id,
        type: 'feature',
        visible: false
      } as LayerConfig));
    }
    return parent;
  }
}

