import { TestBed } from '@angular/core/testing';

import { AddAnalyseService } from './analyse.service';

describe('AddAnalyseService', () => {
  let service: AddAnalyseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddAnalyseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
