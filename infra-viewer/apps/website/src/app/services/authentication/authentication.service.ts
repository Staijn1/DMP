import {Injectable} from '@angular/core';
import esriId from '@arcgis/core/identity/IdentityManager';
import {Router} from '@angular/router';
import {environment} from '../../../environments/environment';
import Portal from '@arcgis/core/portal/Portal';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private static credential: __esri.Credential;
  private readonly appId = 'jpL480B69UHL0NWO';
  private readonly portalURL = environment.portalURL;
  private readonly portalSharingUrl = this.portalURL + '/sharing/';

  get isLoggedIn(): boolean {
    return AuthenticationService.credential !== undefined;
  }

  constructor(private router: Router) {
  }

  /**
   * Redirect the user to the Arcgis Enterprise login portal
   */
  login() {
    window.location.href = this.portalSharingUrl + 'oauth2/authorize?client_id=' + this.appId + '&response_type=token&redirect_uri=' + environment.redirectUri;
  }

  /**
   * Finish the login process by getting the token from the url and setting it in the identity manager
   */
  finishLogin() {
    // Get the token from the url, it is in the format #access_token=token&expires_in=3600&token_type=Bearer
    const token = window.location.hash.split('&')[0].split('=')[1];
    const expiration = window.location.hash.split('&')[1].split('=')[1];
    esriId.registerToken({
      server: this.portalSharingUrl,
      token: token,
      expires: isNaN(Number(expiration)) ? new Date().getTime() + (3600 * 1000) : Number(expiration)
    });
    esriId.getCredential(this.portalSharingUrl).then((credential) => {
      AuthenticationService.credential = credential
      return this.router.navigateByUrl('/map');
    }).catch(e => console.error(e))
  }
}
