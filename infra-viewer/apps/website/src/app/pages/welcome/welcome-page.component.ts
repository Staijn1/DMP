import {Component} from '@angular/core';
import {environment} from '../../../environments/environment';
import {AuthenticationService} from '../../services/authentication/authentication.service';
import {
  faAreaChart,
  faCog,
  faCube,
  faRuler,
  faRulerCombined,
  faSearchLocation,
  faStore
} from '@fortawesome/free-solid-svg-icons';
import {facShadeCast} from '../../utils/CustomIcons';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss'],
})
export class WelcomePageComponent {
  icon3D = faCube;
  distanceMeasureIcon = faRuler;
  surfaceMeasureIcon = faRulerCombined;
  configureIcon = faCog;
  hubIcon = faStore;
  searchIcon = faSearchLocation;
  shadowIcon = facShadeCast;
  elevationProfileIcon = faAreaChart;

  constructor(public readonly authService: AuthenticationService) {
  }

  /**
   * Uses the environments api url to get the url to the publicly hosted images
   * It does this by removing /api from the end of the url and replacing it with {imagename}
   * @param imagename
   */
  getSrc(imagename: string): string {
    // Strip off the /api from the end of the url
    const url = environment.api.substring(0, environment.api.length - 4);
    // Add the image name to the end of the url
    return `${url}/public/${imagename}`;
  }
}
