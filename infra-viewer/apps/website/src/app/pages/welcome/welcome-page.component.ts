import { Component } from "@angular/core";
import { AuthenticationService } from "../../services/authentication/authentication.service";
import {
  faAreaChart,
  faCog,
  faCube,
  faRuler,
  faRulerCombined,
  faSearchLocation,
  faStore
} from "@fortawesome/free-solid-svg-icons";
import { facShadeCast } from "../../utils/CustomIcons";

@Component({
  selector: "app-welcome-page",
  templateUrl: "./welcome-page.component.html",
  styleUrls: ["./welcome-page.component.scss"]
})
export class WelcomePageComponent {
  icon3D = faCube;
  distanceMeasureIcon = faRuler;
  surfaceMeasureIcon = faRulerCombined;
  configureIcon = faCog;
  hubIcon = faStore;
  searchIcon = faSearchLocation;
  shadowIcon = facShadeCast;
  elevationProfileIcon = faAreaChart;

  constructor(public readonly authService: AuthenticationService) {
  }
}
