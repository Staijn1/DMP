import {Injectable} from '@angular/core';
import Query from '@arcgis/core/rest/support/Query';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

@Injectable({
  providedIn: 'root'
})
export class QueryService {

  queryOnLocation(mapPoint: __esri.Point, layers: __esri.Collection<__esri.Layer>): Promise<__esri.FeatureSet[]> {
    const query = new Query();
    query.geometry = mapPoint;
    query.distance = 100;
    query.units = 'meters';
    query.outFields = ['*'];
    query.returnGeometry = true;

    const querySupportedLayers = layers.filter(layer => layer.type === 'feature' || layer.type === 'geojson');
    console.log(querySupportedLayers.map(layer => layer.title));
    // Create an array of promises, one for each layer
    const promises = querySupportedLayers.map(layer => (layer as FeatureLayer).queryFeatures(query));
    // Return a promise that resolves when all promises in the array have resolved
    return Promise.all(promises);
  }
}
