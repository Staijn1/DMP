import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './main/app.component';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(
      [
        {
          path: '',
          loadChildren: () =>
            import('./pages/welcome/welcome-page.module').then(
              (m) => m.WelcomePageModule
            ),
        },
        {
          path: 'map',
          loadChildren: () =>
            import('./pages/map-page/map-page.module').then(
              (m) => m.MapPageModule
            ),
        },
        {
          path: 'config',
          loadChildren: () =>
            import('./pages/config-page/config-page.module').then(
              (m) => m.ConfigPageModule
            ),
        },
        {
          path: 'login',
          loadChildren: () =>
            import('./pages/login-page/login-page.module').then(
              (m) => m.LoginPageModule
            ),
        },
      ],
      {initialNavigation: 'enabledBlocking'}
    ),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}
