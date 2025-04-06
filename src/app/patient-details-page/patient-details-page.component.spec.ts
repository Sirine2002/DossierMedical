import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDetailsPageComponent } from './patient-details-page.component';

describe('PatientDetailsPageComponent', () => {
  let component: PatientDetailsPageComponent;
  let fixture: ComponentFixture<PatientDetailsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PatientDetailsPageComponent]
    });
    fixture = TestBed.createComponent(PatientDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
