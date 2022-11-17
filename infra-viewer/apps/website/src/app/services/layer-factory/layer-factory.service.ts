import {Injectable} from '@angular/core';
import {LayerConfig, LayerConstructor, SystemConfigurationLayerTypes} from '@infra-viewer/interfaces';
import SceneLayer from '@arcgis/core/layers/SceneLayer';
import ElevationLayer from '@arcgis/core/layers/ElevationLayer';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Layer from '@arcgis/core/layers/Layer';
import SceneLayerProperties = __esri.SceneLayerProperties;
import ElevationLayerProperties = __esri.ElevationLayerProperties;
import GeoJSONLayerProperties = __esri.GeoJSONLayerProperties;
import FeatureLayerProperties = __esri.FeatureLayerProperties;

@Injectable({
  providedIn: 'root'
})
export class LayerFactoryService {

  constructLayer(layerConfig: LayerConfig): Layer {
    // Create a copy of the layer config
    const layerConfigCopy = {...layerConfig};

    const layerType = layerConfig.type as SystemConfigurationLayerTypes;
    // Remove layer type from config
    delete (layerConfigCopy as any).type;
    const constructList: LayerConstructor = {
      'scene': () => new SceneLayer(layerConfigCopy as SceneLayerProperties),
      'elevation': () => new ElevationLayer(layerConfigCopy as ElevationLayerProperties),
      'geoJSON': () => new GeoJSONLayer(layerConfigCopy as GeoJSONLayerProperties),
      'feature': () => new FeatureLayer(layerConfigCopy as FeatureLayerProperties)
    }
    const constructedLayer = constructList[layerType as SystemConfigurationLayerTypes];
    if (!constructedLayer) console.error('Unsupported layer type: ' + layerType)


    return constructedLayer();
  }
}
