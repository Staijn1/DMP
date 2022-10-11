import {Injectable} from '@angular/core';
import Query from '@arcgis/core/rest/support/Query';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import Collection from '@arcgis/core/core/Collection';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';
import Symbol from '@arcgis/core/symbols/Symbol';

@Injectable({
  providedIn: 'root'
})
export class QueryService {

  private determineSymbolForFeature(feature: __esri.Graphic, renderer: __esri.Renderer): __esri.Symbol {
    switch (renderer.type) {
      case 'simple':
        return (renderer as SimpleRenderer).symbol;
      case 'unique-value': {
        const uniqueValueRenderer = renderer as __esri.UniqueValueRenderer;
        const value = feature.attributes[uniqueValueRenderer.field];
        const uniqueValueInfo = uniqueValueRenderer.uniqueValueInfos.find(info => info.value === value);
        if (uniqueValueInfo) {
          return uniqueValueInfo.symbol;
        } else {
          return uniqueValueRenderer.defaultSymbol;
        }
        break;
      }
      default:
        console.warn('Unsupported renderer type: ' + renderer.type);
        return new Symbol()
    }
  }


  async queryOnLocation(mapPoint: __esri.Point, layers: __esri.Collection<__esri.Layer>): Promise<__esri.FeatureSet[]> {
    const query = new Query();
    query.geometry = mapPoint;
    query.distance = 100;
    query.units = 'meters';
    query.outFields = ['*'];
    query.returnGeometry = true;

    const querySupportedLayers = layers.filter(layer => layer.type === 'feature' || layer.type === 'geojson') as Collection<FeatureLayer>;
    const featureSet: FeatureSet[] = []

    for (const featureLayer of querySupportedLayers) {
      const features = await featureLayer.queryFeatures(query);

      for (const feature of features.features) {
        feature.symbol = this.determineSymbolForFeature(feature, featureLayer.renderer);
      }
      featureSet.push(features);
    }

    return featureSet;
  }
}
