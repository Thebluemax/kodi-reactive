import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { GenreKodiRepository } from './genre-kodi.repository';
import { KodiConfigService } from '@shared/services/kodi-config.service';

const JSON_RPC_URL = 'http://localhost:8008/jsonrpc';

describe('GenreKodiRepository', () => {
  let repository: GenreKodiRepository;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: KodiConfigService, useValue: { jsonRpcUrl: JSON_RPC_URL } }
      ]
    });

    repository = TestBed.inject(GenreKodiRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('devuelve los géneros y el total', () => {
    let total = -1;
    repository.getGenres().subscribe(result => (total = result.total));

    httpMock.expectOne(JSON_RPC_URL).flush({
      id: 1,
      jsonrpc: '2.0',
      result: { genres: [{ genreid: 1, label: 'Rock' }], limits: { total: 1 } }
    });

    expect(total).toBe(1);
  });

  it('propaga el rechazo de Kodi, que llega con HTTP 200', () => {
    // Antes se leia result.genres sobre un undefined, y el fallo llegaba como
    // "Cannot read properties of undefined" en lugar del motivo real.
    let caught: Error | undefined;
    repository.getGenres().subscribe({ error: (err: Error) => (caught = err) });

    httpMock.expectOne(JSON_RPC_URL).flush({
      id: 1,
      jsonrpc: '2.0',
      error: { code: -32601, message: 'Method not found' }
    });

    expect(caught?.message).toContain('Method not found');
  });

  it('avisa si Kodi no devuelve resultado ni error', () => {
    let caught: Error | undefined;
    repository.getGenres().subscribe({ error: (err: Error) => (caught = err) });

    httpMock.expectOne(JSON_RPC_URL).flush({ id: 1, jsonrpc: '2.0' });

    expect(caught?.message).toContain('ningún resultado');
  });
});
