import {Injectable} from '@angular/core';
import Query from '@arcgis/core/rest/support/Query';
import SceneLayer from '@arcgis/core/layers/SceneLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

@Injectable({
  providedIn: 'root'
})
export class QueryService {

  public async queryOnTime(layer: __esri.FeatureLayer, from: Date | string, to: Date | string, field: string): Promise<__esri.FeatureSet> {
    // If from and to are strings, convert them to Date objects
    if (typeof from === 'string') {
      from = new Date(from);
    }
    if (typeof to === 'string') {
      to = new Date(to);
    }

    const query = layer.createQuery();
    query.outFields = ['*'];
    query.where = `${field} >= ${from.getTime()} AND ${field} <= ${to.getTime()}`;

    return layer.queryFeatures(query);
  }

  queryOnLocation(mapPoint: __esri.Point, layers: __esri.Layer[]): Promise<__esri.FeatureSet[]> {
    const query = new Query();
    query.geometry = mapPoint;
    query.distance = 100;
    query.units = 'meters';
    query.spatialRelationship = 'intersects';
    query.outFields = ['*'];
    query.returnGeometry = true;

    const querySupportedLayers = layers.filter(layer => layer.type === 'feature' || layer.type === 'geojson');
    // Create an array of promises, one for each layer
    const promises = layers.map(layer => (layer as FeatureLayer).queryFeatures(query));
    // Return a promise that resolves when all promises in the array have resolved
    return Promise.all(promises);
  }
}
