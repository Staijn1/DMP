import {Injectable} from '@angular/core';
import Query from '@arcgis/core/rest/support/Query';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Collection from '@arcgis/core/core/Collection';
import Layer from '@arcgis/core/layers/Layer';
import Point from '@arcgis/core/geometry/Point';
import {QueriedFeatures} from '@infra-viewer/interfaces';

@Injectable({
  providedIn: 'root'
})
export class QueryService {
  async queryOnLocation(mapPoint: Point, layers: Collection<Layer>): Promise<QueriedFeatures[]> {
    const query = new Query();
    query.geometry = mapPoint;
    query.distance = 100;
    query.units = 'meters';
    query.outFields = ['*'];
    query.returnGeometry = true;

    const querySupportedLayers = layers.filter(layer => layer.type === 'feature' || layer.type === 'geojson') as Collection<FeatureLayer>;

    // Query all the layers
    const queryResults = await Promise.all(querySupportedLayers.map(async (layer) => {
      const featureSet = await layer.queryFeatures(query);
      return {featureSet, layer};
    }));


    return queryResults
  }
}
