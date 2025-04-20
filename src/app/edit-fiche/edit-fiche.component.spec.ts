import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFicheComponent } from './edit-fiche.component';

describe('EditFicheComponent', () => {
  let component: EditFicheComponent;
  let fixture: ComponentFixture<EditFicheComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditFicheComponent]
    });
    fixture = TestBed.createComponent(EditFicheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
