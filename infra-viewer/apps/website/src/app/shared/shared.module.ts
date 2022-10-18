import {ArcgisMapComponent} from './components/arcgis-map/arcgis-map.component';
import {NgModule} from '@angular/core';
import {FeatureGridComponent} from './components/feature-grid/feature-grid.component';
import {AgGridModule} from 'ag-grid-angular';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
  declarations: [ArcgisMapComponent, FeatureGridComponent],
  exports: [ArcgisMapComponent, FeatureGridComponent],
  imports: [
    AgGridModule,
    CommonModule,
    HttpClientModule
  ],
  providers: []
})
export class SharedModule {
}
