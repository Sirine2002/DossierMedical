import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFicheComponent } from './add-fiche.component';

describe('AddFicheComponent', () => {
  let component: AddFicheComponent;
  let fixture: ComponentFixture<AddFicheComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddFicheComponent]
    });
    fixture = TestBed.createComponent(AddFicheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
