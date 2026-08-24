import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { InputKodiRepository } from './input-kodi.repository';
import { KodiConfigService } from '@shared/services/kodi-config.service';

const JSON_RPC_URL = 'http://localhost:8008/jsonrpc';
const REMOTE_URL = `${JSON_RPC_URL}?mediaplayer`;

describe('InputKodiRepository', () => {
  let repository: InputKodiRepository;
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

    repository = TestBed.inject(InputKodiRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('envía la acción al endpoint del mando', () => {
    repository.navigateUp().subscribe();

    const req = httpMock.expectOne(REMOTE_URL);
    const body = req.request.body as { method: string };

    expect(body.method).toContain('Input.');
    req.flush({ id: 1, jsonrpc: '2.0', result: 'OK' });
  });

  it('completa cuando Kodi acepta la orden', () => {
    let completed = false;
    repository.navigateUp().subscribe({ complete: () => (completed = true) });

    httpMock.expectOne(REMOTE_URL).flush({ id: 1, jsonrpc: '2.0', result: 'OK' });

    expect(completed).toBeTrue();
  });

  it('propaga el rechazo de Kodi, que llega con HTTP 200', () => {
    // Antes se ignoraba la respuesta: una orden rechazada pasaba por buena y el
    // mando parecia no hacer nada, sin ningun aviso.
    let caught: Error | undefined;
    repository.navigateUp().subscribe({ error: (err: Error) => (caught = err) });

    httpMock.expectOne(REMOTE_URL).flush({
      id: 1,
      jsonrpc: '2.0',
      error: { code: -32100, message: 'Failed to execute method' }
    });

    expect(caught?.message).toContain('Failed to execute method');
    expect(caught?.message).toContain('-32100');
  });
});
