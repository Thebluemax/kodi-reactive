import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { GenreService } from './genre.service';

describe('GenreService', () => {
  let service: GenreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    });
    service = TestBed.inject(GenreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
