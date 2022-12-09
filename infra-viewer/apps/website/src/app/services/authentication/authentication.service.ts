import {Injectable} from '@angular/core';
import esriId from '@arcgis/core/identity/IdentityManager';
import {Router} from '@angular/router';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private readonly appId = 'jpL480B69UHL0NWO';
  private readonly portalURL = environment.portalURL;
  private readonly portalSharingUrl = this.portalURL + '/sharing/';

  constructor(private router: Router) {
  }

  private _token!: string;

  get token(): string {
    return this._token;
  }

  get isLoggedIn(): boolean {
    const credential = sessionStorage.getItem('credential');

    if (!credential) return false;

    try {
      const parsed = JSON.parse(credential as string);
      this.registerToken(parsed.token, parsed.expires);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Redirect the user to the Arcgis Enterprise login portal
   */
  login() {
    const redirectUri = this.getRedirectUrl();
    window.location.href = this.portalSharingUrl + 'oauth2/authorize?client_id=' + this.appId + '&response_type=token&redirect_uri=' + redirectUri;
  }

  /**
   * Finish the login process by getting the token from the url and setting it in the identity manager
   */
  finishLogin() {
    // Get the token from the url, it is in the format #access_token=token&expires_in=3600&token_type=Bearer
    const token = window.location.hash.split('&')[0].split('=')[1];
    const expiration = window.location.hash.split('&')[1].split('=')[1];
    this.registerToken(token, expiration);
    esriId.getCredential(this.portalSharingUrl).then((credential) => {
      sessionStorage.setItem('credential', JSON.stringify(credential));
      return this.router.navigateByUrl('/map');
    }).catch(e => console.error(e))
  }

  /**
   * Replace the last part of the URL with /login
   * Example: https://some-subdomain.domain.nl/some-path/home
   * The last part of the URL is part of the angular routing and needs to be replaced with /login
   * It results in https://some-subdomain.domain.nl/some-path/login
   * @private
   */
  getRedirectUrl(): string {
    const currentUrl = window.location.href;
    return currentUrl.replace(/\/[^/]*$/, "/login");
  }

  private registerToken(token: string, expiration: string) {
    this._token = token;
    esriId.registerToken({
      server: this.portalSharingUrl,
      token: token,
      expires: isNaN(Number(expiration)) ? new Date().getTime() + (3600 * 1000) : Number(expiration)
    });
    esriId.checkSignInStatus(this.portalSharingUrl).then().catch(e => this.login());
  }
}
