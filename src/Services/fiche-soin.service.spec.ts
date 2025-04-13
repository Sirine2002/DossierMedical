import { TestBed } from '@angular/core/testing';

import { FicheSoinService } from './fiche-soin.service';

describe('FicheSoinService', () => {
  let service: FicheSoinService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FicheSoinService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
