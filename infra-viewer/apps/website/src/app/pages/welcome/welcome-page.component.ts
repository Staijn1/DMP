import {Component} from '@angular/core';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss'],
})
export class WelcomePageComponent {

  /**
   * Uses the environments api url to get the url to the publicly hosted images
   * It does this by removing /api from the url and replacing it with {imagename}
   * @param imagename
   */
  getSrc(imagename: string): string {
    return environment.api.replace('/api', `/${imagename}`);
  }
}
