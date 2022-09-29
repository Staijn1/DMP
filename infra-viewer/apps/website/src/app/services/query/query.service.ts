import {Injectable} from '@angular/core';
import Query from '@arcgis/core/rest/support/Query';
import SceneLayer from '@arcgis/core/layers/SceneLayer';

@Injectable({
  providedIn: 'root'
})
export class QueryService {

  public async queryOnTime(layer: __esri.FeatureLayer | __esri.FeatureLayer, from: Date | string, to: Date | string, field: string): Promise<__esri.FeatureSet> {
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
}
