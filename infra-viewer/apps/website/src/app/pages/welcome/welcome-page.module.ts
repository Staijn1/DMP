import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WelcomePageComponent} from './welcome-page.component';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../../shared/shared.module';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {WelcomePage3DComponent} from "./welcome-page3-d.component";

@NgModule({
  declarations: [WelcomePageComponent, WelcomePage3DComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{path: '', component: WelcomePage3DComponent}]),
    SharedModule,
    FontAwesomeModule,
  ],
})
export class WelcomePageModule {
}
