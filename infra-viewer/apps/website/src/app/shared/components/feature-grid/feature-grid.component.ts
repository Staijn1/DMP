import {Component, OnInit, ViewChild} from '@angular/core';
import {AgGridAngular} from 'ag-grid-angular';
import {Observable} from 'rxjs';
import {CellClickedEvent, ColDef, GridReadyEvent} from 'ag-grid-community';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-feature-grid',
  templateUrl: './feature-grid.component.html',
  styleUrls: ['./feature-grid.component.scss'],
})
export class FeatureGridComponent {

  // Each Column Definition results in one Column.
  public columnDefs: ColDef[] = [
    { field: 'make'},
    { field: 'model'},
    { field: 'price' }
  ];

  // DefaultColDef sets props common to all Columns
  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
  };

  // Data that gets displayed in the grid
  public rowData$!: Observable<any[]>;

  // For accessing the Grid's API
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  constructor(private http: HttpClient) {}

  // Example load data from sever
  onGridReady(params: GridReadyEvent) {
    this.rowData$ = this.http
      .get<any[]>('https://www.ag-grid.com/example-assets/row-data.json');
  }

  // Example of consuming Grid Event
  onCellClicked( e: CellClickedEvent): void {
    console.log('cellClicked', e);
  }

  // Example using Grid's API
  clearSelection(): void {
    this.agGrid.api.deselectAll();
  }
}
