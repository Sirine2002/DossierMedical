import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FichesSoinComponent } from './fiches-soin.component';

describe('FichesSoinComponent', () => {
  let component: FichesSoinComponent;
  let fixture: ComponentFixture<FichesSoinComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FichesSoinComponent]
    });
    fixture = TestBed.createComponent(FichesSoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
