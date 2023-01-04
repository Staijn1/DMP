import { Injectable, OnDestroy } from "@angular/core";
import { HTTPService } from "../HTTP/http.service";
import { HubItem, LayerConfig, SystemConfiguration } from "@infra-viewer/interfaces";
import { getTypeForHubItem } from "../../utils/utils";
import { StorageService } from "../storage/storage.service";
import { MessageService } from "../message-service/message.service";

@Injectable({
  providedIn: "root"
})
export class ConfigurationService extends HTTPService implements OnDestroy {
  public static configuration: SystemConfiguration | null = null;

  constructor(private storageService: StorageService, messageService: MessageService) {
    super(messageService);
  }

  async getConfiguration(): Promise<SystemConfiguration> {
    let config = this.storageService.get("configuration", localStorage);

    if (!config) {
      config = await this.request("assets/SystemConfiguration.json", {});
      this.storageService.store("configuration", config, localStorage);
    }

    ConfigurationService.configuration = config;
    return config;
  }

  async setConfiguration(configuration: SystemConfiguration): Promise<void> {
    this.storageService.store("configuration", configuration, localStorage);
    ConfigurationService.configuration = configuration;
  }

  ngOnDestroy(): void {
    ConfigurationService.configuration = null;
  }

  async addLayer(hubItem: HubItem): Promise<void> {
    const configuration = await this.getConfiguration();

    const layer: any = {
      url: hubItem.url,
      title: hubItem.title.replace(/_/g, " "),
      type: getTypeForHubItem(hubItem)
    };
    configuration.layers.push(layer);

    await this.setConfiguration(configuration);
  }

  async removeLayer(hubItem: HubItem | LayerConfig) {
    const configuration = await this.getConfiguration();

    configuration.layers = configuration.layers.filter(l => l.url !== hubItem.url);

    await this.setConfiguration(configuration);
  }
}
