import {Component} from '@angular/core';
import {ConfigurationService} from '../services/configuration/configuration.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  constructor(private readonly configurationService: ConfigurationService) {
    this.configurationService.getConfiguration().then((configuration) => {
      console.log(configuration);
    });
  }
}
