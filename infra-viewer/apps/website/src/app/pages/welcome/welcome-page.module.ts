import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WelcomePageComponent} from './welcome-page.component';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [WelcomePageComponent],
  imports: [CommonModule, RouterModule.forChild([{path: '', component: WelcomePageComponent}])],
})
export class WelcomePageModule {
}
