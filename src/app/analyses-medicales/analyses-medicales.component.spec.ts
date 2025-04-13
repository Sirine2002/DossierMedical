import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysesMedicalesComponent } from './analyses-medicales.component';

describe('AnalysesMedicalesComponent', () => {
  let component: AnalysesMedicalesComponent;
  let fixture: ComponentFixture<AnalysesMedicalesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnalysesMedicalesComponent]
    });
    fixture = TestBed.createComponent(AnalysesMedicalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
