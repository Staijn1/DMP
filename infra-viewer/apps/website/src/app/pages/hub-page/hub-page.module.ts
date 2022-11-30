import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {HubPageComponent} from './hub-page.component';
import {FormsModule} from '@angular/forms';
import {SharedModule} from '../../shared/shared.module';
import {DragDropModule} from '@angular/cdk/drag-drop';


@NgModule({
  declarations: [HubPageComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: HubPageComponent,
      }]),
    CommonModule,
    FormsModule,
    SharedModule,
    DragDropModule
  ]
})
export class HubPageModule {
}
