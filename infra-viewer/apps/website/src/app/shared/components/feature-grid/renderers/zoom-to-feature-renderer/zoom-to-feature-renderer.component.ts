import {Component} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {ICellRendererParams} from 'ag-grid-community';

@Component({
  selector: 'app-zoom-to-feature-renderer',
  template: `
    <div class="uk-width-1-1 uk-flex uk-flex-center uk-items-middle" (click)="onClick()">
      <span uk-icon="icon: location"></span>
    </div>`,
})
export class ZoomToFeatureRendererComponent implements ICellRendererAngularComp {
  private params!: ICellRendererParams;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(params: ICellRendererParams<any>): boolean {
    return false;
  }

  onClick() {
    (this.params as any).clicked(this.params.data);
  }
}
