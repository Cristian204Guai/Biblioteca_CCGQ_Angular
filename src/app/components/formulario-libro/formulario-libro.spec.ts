import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioLibro } from './formulario-libro';

describe('FormularioLibro', () => {
  let component: FormularioLibro;
  let fixture: ComponentFixture<FormularioLibro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioLibro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioLibro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
