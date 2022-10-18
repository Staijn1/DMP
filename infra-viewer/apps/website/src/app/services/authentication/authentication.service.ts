import {Injectable, OnDestroy} from '@angular/core';
import esriId from '@arcgis/core/identity/IdentityManager';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import OAuthInfo from '@arcgis/core/identity/OAuthInfo';
import {environment} from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService implements OnDestroy {
  private readonly appId = 'jpL480B69UHL0NWO';
  private readonly portalURL = 'https://geo.arnhem.nl/portal';
  private readonly portalSharingUrl = this.portalURL + '/sharing/';
  private routeSubscription: Subscription | undefined;

  constructor(private router: Router) {
    const info = new OAuthInfo({
      appId: this.appId,
      portalUrl: this.portalURL,
      flowType: 'auto',
      popup: true,
      popupCallbackUrl: environment.redirectUri,
    });

    esriId.registerOAuthInfos([info]);
  }

  /**
   * Redirect the user to the Arcgis Enterprise login portal
   */
  login() {
    esriId.getCredential(this.portalSharingUrl, {
        oAuthPopupConfirmation: false
      }
    ).then((credential) => {
      console.log(credential);
      this.router.navigate(['/map']).then();
    });
  }

  /**
   * Finish the login process by getting the token from the url and setting it in the identity manager
   */
  finishLogin() {
    if (opener) {
      if (location.hash) {
        // opener.console.log("oauth callback href:", location.href);
        if (typeof opener.require === 'function' && opener.require('esri/kernel')) {
          opener.require('esri/kernel').id.setOAuthResponseHash(location.hash);
        } else {
          opener.dispatchEvent(new CustomEvent('arcgis:auth:hash', {detail: location.hash}));
        }
        close();
      } else if (location.search) {
        opener.dispatchEvent(new CustomEvent('arcgis:auth:location:search', {detail: location.search}));
        close();
      }
    } else {
      close();
    }
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) this.routeSubscription.unsubscribe();
  }
}
