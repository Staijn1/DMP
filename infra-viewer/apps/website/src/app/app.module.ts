import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './main/app.component';
import { RouterModule } from '@angular/router';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(
      [
        {
          path: '',
          redirectTo: 'home',
          pathMatch: 'full',
        },
        {
          path: 'home',
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
        {
          path: 'hub',
          loadChildren: () =>
            import('./pages/hub-page/hub-page.module').then(
              (m) => m.HubPageModule
            ),
        }
      ],
      { initialNavigation: 'enabledBlocking' }
    ),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
