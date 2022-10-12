import {TestBed} from '@angular/core/testing';

import {MapUIBuilderService} from './map-uibuilder.service';

describe('MapUIBuilderService', () => {
  let service: MapUIBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapUIBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
