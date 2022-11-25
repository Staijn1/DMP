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
import {NgxSliderModule} from '@angular-slider/ngx-slider';
import {ScrollTrackerDirective} from './directives/scrolling/scroll-tracker.directive';
import {LayerEditorComponent} from './components/layer-editor/layer-editor.component';
import {PipesModule} from '../pipes/pipes.module';
import {NgSelectModule} from '@ng-select/ng-select';

@NgModule({
  declarations: [
    SketchQueryWidgetComponent,
    ArcgisMapComponent,
    FeatureGridComponent,
    ZoomToFeatureRendererComponent,
    ScrollTrackerDirective,
    LayerEditorComponent,
  ],
  exports: [ArcgisMapComponent, FeatureGridComponent, ScrollTrackerDirective, LayerEditorComponent],
  imports: [AgGridModule, CommonModule, FormsModule, NgxSliderModule, PipesModule, NgSelectModule],
  providers: [],
})
export class SharedModule {
}
