import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAnalysteComponent } from './dashboard-analyste.component';

describe('DashboardAnalysteComponent', () => {
  let component: DashboardAnalysteComponent;
  let fixture: ComponentFixture<DashboardAnalysteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardAnalysteComponent]
    });
    fixture = TestBed.createComponent(DashboardAnalysteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
