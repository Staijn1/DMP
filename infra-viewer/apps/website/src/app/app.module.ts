import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './main/app.component';
import {RouterModule} from '@angular/router';
import {ArcgisMapComponent} from './shared/components/arcgis-map/arcgis-map.component';
import {SharedModule} from './shared/shared.module';
import {MapPageComponent} from './pages/map-page/map-page.component';

@NgModule({
  declarations: [AppComponent, MapPageComponent],
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
        }
      ],
      {initialNavigation: 'enabledBlocking'}
    ),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}
