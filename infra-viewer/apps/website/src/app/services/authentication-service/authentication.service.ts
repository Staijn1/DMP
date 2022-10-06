import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
/**
 * This service is responsible for authenticating the user.
 * It implements the serverless web authentication flow.
 * @see https://developers.arcgis.com/documentation/mapping-apis-and-services/security/arcgis-identity/serverless-web-apps/
 */
export class AuthenticationService {
  private readonly clientId = 'arcgisonline';
  private readonly redirectUri = environment.redirectUri;

  /**
   * Start the login process by redirecting the user to the page where they can log in
   */
  startLogin(): void {
    window.open(`https://www.arcgis.com/sharing/rest/oauth2/authorize?client_id=${this.clientId}&response_type=token&expiration=20160&redirect_uri=${window.encodeURIComponent(this.redirectUri)}`, 'oauth-window', 'height=400,width=600,menubar=no,location=yes,resizable=yes,scrollbars=yes,status=yes')
  }
}
