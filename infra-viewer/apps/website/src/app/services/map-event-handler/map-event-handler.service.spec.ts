import {TestBed} from '@angular/core/testing';

import {MapEventHandlerService} from './map-event-handler.service';

describe('MapEventHandlerService', () => {
  let service: MapEventHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapEventHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
