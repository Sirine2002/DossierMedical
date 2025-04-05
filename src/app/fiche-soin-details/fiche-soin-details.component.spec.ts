import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheSoinDetailsComponent } from './fiche-soin-details.component';

describe('FicheSoinDetailsComponent', () => {
  let component: FicheSoinDetailsComponent;
  let fixture: ComponentFixture<FicheSoinDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FicheSoinDetailsComponent]
    });
    fixture = TestBed.createComponent(FicheSoinDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
