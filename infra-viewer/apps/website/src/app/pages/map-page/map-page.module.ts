import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MapPageComponent } from "./map-page.component";
import { SharedModule } from "../../shared/shared.module";


@NgModule({
  declarations: [MapPageComponent],
  imports: [
    SharedModule,
    CommonModule,
    RouterModule.forChild([{ path: "", component: MapPageComponent }])
  ]
})
export class MapPageModule {
}
