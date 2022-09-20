import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './main/app.component';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      {path: '', loadChildren: () => import('./pages/welcome/welcome-page.module').then(m => m.WelcomePageModule)},
    ], {initialNavigation: 'enabledBlocking'}),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}
