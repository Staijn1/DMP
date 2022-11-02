import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {HubPageComponent} from './hub-page.component';


@NgModule({
  declarations: [HubPageComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: HubPageComponent,
      }]),
    CommonModule
  ]
})
export class HubPageModule {
}
