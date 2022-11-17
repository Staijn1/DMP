import {ArcgisMapComponent} from './components/arcgis-map/arcgis-map.component';
import {NgModule} from '@angular/core';
import {FeatureGridComponent} from './components/feature-grid/feature-grid.component';
import {AgGridModule} from 'ag-grid-angular';
import {CommonModule} from '@angular/common';
import {
  ZoomToFeatureRendererComponent
} from './components/feature-grid/renderers/zoom-to-feature-renderer/zoom-to-feature-renderer.component';
import {
  SketchQueryWidgetComponent
} from './components/arcgis-map/widgets/SketchQueryWidget/sketch-query-widget.component';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    SketchQueryWidgetComponent,
    ArcgisMapComponent,
    FeatureGridComponent,
    ZoomToFeatureRendererComponent,
  ],
  exports: [ArcgisMapComponent, FeatureGridComponent],
  imports: [AgGridModule, CommonModule, FormsModule],
  providers: [],
})
export class SharedModule {
}
