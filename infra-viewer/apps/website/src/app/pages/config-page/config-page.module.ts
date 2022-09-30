import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {ConfigPageComponent} from './config-page.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([{path: '', component: ConfigPageComponent}]),
  ]
})
export class ConfigPageModule {
}
