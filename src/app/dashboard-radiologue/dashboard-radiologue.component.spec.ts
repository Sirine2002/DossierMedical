import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardRadiologueComponent } from './dashboard-radiologue.component';

describe('DashboardRadiologueComponent', () => {
  let component: DashboardRadiologueComponent;
  let fixture: ComponentFixture<DashboardRadiologueComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardRadiologueComponent]
    });
    fixture = TestBed.createComponent(DashboardRadiologueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
