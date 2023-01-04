import { NgModule } from "@angular/core";
import { CastPipe } from "./cast/cast.pipe";

@NgModule({
  declarations: [CastPipe],
  exports: [CastPipe]
})
export class PipesModule {
}
