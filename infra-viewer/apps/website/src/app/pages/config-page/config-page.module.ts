import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {ConfigPageComponent} from './config-page.component';
import {FormsModule} from '@angular/forms';


@NgModule({
  declarations: [ConfigPageComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{path: '', component: ConfigPageComponent}]),
    FormsModule,
  ]
})
export class ConfigPageModule {
}
