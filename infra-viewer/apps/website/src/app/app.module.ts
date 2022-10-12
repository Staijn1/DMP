import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './main/app.component';
import {RouterModule} from '@angular/router';
import {SharedModule} from './shared/shared.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    SharedModule,
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
      ],
      { initialNavigation: 'enabledBlocking' }
    ),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
