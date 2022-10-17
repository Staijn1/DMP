import {Component} from '@angular/core';
import {ConfigurationService} from '../services/configuration/configuration.service';
import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private readonly configurationService: ConfigurationService) {
    // loads the Icon plugin
    UIkit.use(Icons);
    this.configurationService.setArcgisKey()
    this.configurationService.getConfiguration().then();
  }
}
