import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {HubPageComponent} from './hub-page.component';
import {FormsModule} from '@angular/forms';
import {SharedModule} from '../../shared/shared.module';


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
    SharedModule
  ]
})
export class HubPageModule {
}
