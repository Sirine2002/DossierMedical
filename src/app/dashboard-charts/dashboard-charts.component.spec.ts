import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardChartsComponent } from './dashboard-charts.component';

describe('DashboardChartsComponent', () => {
  let component: DashboardChartsComponent;
  let fixture: ComponentFixture<DashboardChartsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardChartsComponent]
    });
    fixture = TestBed.createComponent(DashboardChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
