import {Component} from '@angular/core';
import {AuthenticationService} from '../../services/authentication-service/authentication.service';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.css'],
})
export class WelcomePageComponent {
  constructor(private authService: AuthenticationService) {
  }
  startLogin(): void {
      this.authService.startLogin();
  }
}
