import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {AgGridAngular} from 'ag-grid-angular';
import {ColDef, FilterChangedEvent, GridOptions, GridReadyEvent} from 'ag-grid-community';
import {QueriedFeatures} from '@infra-viewer/interfaces';
import Graphic from '@arcgis/core/Graphic';
import {ZoomToFeatureRendererComponent} from './renderers/zoom-to-feature-renderer/zoom-to-feature-renderer.component';
import {ArcgisMapComponent} from '../arcgis-map/arcgis-map.component';


@Component({
  selector: 'app-feature-grid',
  templateUrl: './feature-grid.component.html',
  styleUrls: ['./feature-grid.component.scss'],
})
export class FeatureGridComponent {
  // For accessing the Grid's API
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
  @Input() input: QueriedFeatures | null = null;
  @Input() map!: ArcgisMapComponent;
  @Output() filterChanged = new EventEmitter<Graphic[]>();
  // DefaultColDef sets props common to all Columns
  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };
  public columnDefs: ColDef[] = [];
  private zoomToFeatureColumn: ColDef = {
    headerName: 'Zoom',
    pinned: 'left',
    cellRenderer: ZoomToFeatureRendererComponent,
    cellRendererParams: {
      clicked: this.zoomToFeature.bind(this),
    },
    width: 100
  };
  gridOptions: GridOptions = {};


  // Data that gets displayed in the grid
  public rowData: Graphic[] = [];


  // Example load data from sever
  onGridReady(params: GridReadyEvent) {
    if (!this.input) return;

    this.createColumnDefs(this.input.featureSet.fields);
    this.createRowData(this.input.featureSet.features);
  }

  zoomToFeature(graphic: Graphic) {
    this.map.highlightAndZoomTo(graphic);
  }

  private createColumnDefs(fields: __esri.Field[]) {
    this.columnDefs.push(this.zoomToFeatureColumn);
    const generatedColumns = fields.map(field => {
      return {
        field: 'attributes.' + field.name,
        headerName: field.alias,
      };
    });
    this.columnDefs = this.columnDefs.concat(generatedColumns);
  }

  private createRowData(graphics: __esri.Graphic[]) {
    this.rowData = graphics;
  }

  /**
   * When the filter changes, emit an event with all the currently visible rows
   * @param {FilterChangedEvent<any>} event
   */
  onFilterChanged(event: FilterChangedEvent) {
    // Get all the visible rows
    const visibleRows = this.agGrid.api.getRenderedNodes().map(node => node.data);
    // Emit the event
    this.filterChanged.emit(visibleRows);
  }
}
