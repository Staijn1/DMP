import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WelcomePageComponent} from './welcome-page.component';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../../shared/shared.module';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [WelcomePageComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{path: '', component: WelcomePageComponent}]),
    SharedModule,
    FontAwesomeModule,
  ],
})
export class WelcomePageModule {
}
