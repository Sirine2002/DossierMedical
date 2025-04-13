import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagesMedicalesComponent } from './images-medicales.component';

describe('ImagesMedicalesComponent', () => {
  let component: ImagesMedicalesComponent;
  let fixture: ComponentFixture<ImagesMedicalesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImagesMedicalesComponent]
    });
    fixture = TestBed.createComponent(ImagesMedicalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
