import {Component} from '@angular/core';
import {ConfigurationService} from '../../services/configuration/configuration.service';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-config-page',
  templateUrl: './config-page.component.html',
  styleUrls: ['./config-page.component.scss'],
})
export class ConfigPageComponent {
  configurationString!: string;

  constructor(private readonly configService: ConfigurationService) {
    this.getInformation();
  }

  private getInformation() {
    this.configService.getConfiguration().then(config => this.configurationString = JSON.stringify(config, null, 2));
  }

  onConfigurationSubmit(form: NgForm) {

    this.configService.setConfiguration(form.value.configuration).then(() => this.getInformation());
  }
}
