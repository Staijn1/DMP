import {Component} from '@angular/core';
import {ConfigurationService} from '../services/configuration/configuration.service';
import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import {AuthenticationService} from '../services/authentication/authentication.service';
import {NavigationEnd, Router} from '@angular/router';
import * as AOS from 'aos';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private readonly configurationService: ConfigurationService, private authService: AuthenticationService, private router: Router) {
    // loads the Icon plugin
    UIkit.use(Icons);
    this.configurationService.getConfiguration().then();
    AOS.init()
    // Subscribe to all route changes and check if the user is logged in
    // If not, and the route is not /, redirect to /
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        if (this.authService.isLoggedIn) return;

        if (val.url !== '/' && !val.url.includes('/login')) {
          this.router.navigateByUrl('/').then();
        }
      }
    });
  }
}
