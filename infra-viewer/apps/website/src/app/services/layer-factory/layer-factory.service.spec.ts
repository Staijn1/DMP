import {TestBed} from '@angular/core/testing';

import {LayerFactoryService} from './layer-factory.service';

describe('LayerFactoryService', () => {
  let service: LayerFactoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayerFactoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
