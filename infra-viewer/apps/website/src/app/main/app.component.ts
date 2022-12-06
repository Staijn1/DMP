import {Component} from '@angular/core';
import {ConfigurationService} from '../services/configuration/configuration.service';
import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import {AuthenticationService} from '../services/authentication/authentication.service';
import {NavigationEnd, Router} from '@angular/router';
import * as AOS from 'aos';
import {SwUpdate} from '@angular/service-worker';
import {Message, MessageService} from '../services/message-service/message.service';
import {swipeTopAnimation} from '@infra-viewer/ui';
import {FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {facShadeCast} from '../utils/CustomIcons';

@Component({
  selector: 'app-root',
  animations: [swipeTopAnimation],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  readonly menuItems = [
    {
      title: 'Home',
      link: '/home',
      requiresLogin: false
    },
    {
      title: 'Map',
      link: '/map',
      requiresLogin: true
    },
    {
      title: 'Config',
      link: '/config',
      requiresLogin: true
    },
    {
      title: 'Content Hub',
      link: '/hub',
      requiresLogin: true
    }];
  isLoggedIn = false;

  constructor(
    private readonly configurationService: ConfigurationService,
    private authService: AuthenticationService,
    private router: Router,
    private readonly updates: SwUpdate,
    private readonly iconLibrary: FaIconLibrary,
    public messageService: MessageService) {
    this.registerIcons();
    // Initialize the Animate on Scroll library
    AOS.init();

    this.checkForUpdate();
    // Load the configuration
    this.configurationService.getConfiguration().then();
    // Subscribe to all route changes and check if the user is logged in
    // If not, and the route is not /, redirect to /
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.isLoggedIn = this.authService.isLoggedIn;
        if (this.authService.isLoggedIn) return;

        if (val.url !== '/home' && !val.url.includes('/login')) {
          this.router.navigateByUrl('/home').then();
        }
      }
    });
  }

  private registerIcons() {
    // loads the Icon plugin for UIKit
    UIkit.use(Icons);

    this.iconLibrary.addIcons(facShadeCast)
  }

  private checkForUpdate() {
    // Service worker update, but only in production. During development, the service worker is disabled which results in an error.
    // Enabling the service worker would result in a lot of caching, which is not desired during development because it would be hard to test changes.
    if (this.updates.isEnabled) {
      this.updates.checkForUpdate().then((hasUpdate) => {
        if (hasUpdate) {
          this.messageService.setMessage(new Message('info', 'New update available! Click here to update.', () => this.updateApp()))
        }
      })
    }
  }

  updateApp() {
    this.updates.activateUpdate().then(() => document.location.reload())
  }

  onAlertClick(error: Message) {
    if (!error.action) return;
    error.action();
  }

  closeNav(sidenav: HTMLDivElement) {
    UIkit.offcanvas(sidenav).hide();
  }
}
