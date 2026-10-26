import { TestBed } from '@angular/core/testing';

import { Biblioteca } from './biblioteca';

describe('Biblioteca', () => {
  let service: Biblioteca;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Biblioteca);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
