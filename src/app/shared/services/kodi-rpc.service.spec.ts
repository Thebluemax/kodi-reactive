import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { KodiRpcService } from './kodi-rpc.service';
import { KodiConfigService } from './kodi-config.service';
import { Methods } from '@shared/enums/methods';

const JSON_RPC_URL = 'http://localhost:8008/jsonrpc';

describe('KodiRpcService', () => {
  let service: KodiRpcService;
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

    service = TestBed.inject(KodiRpcService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function sent(url = JSON_RPC_URL): Record<string, unknown> {
    const req = httpMock.expectOne(url);
    const body = req.request.body as Record<string, unknown>;
    req.flush({ id: body['id'], jsonrpc: '2.0', result: 'OK' });
    return body;
  }

  describe('query', () => {
    it('arma la petición con el método y los parámetros', () => {
      service.query(Methods.AudioLibraryGetAlbums, { limits: { start: 0 } }).subscribe();
      const body = sent();

      expect(body['jsonrpc']).toBe('2.0');
      expect(body['method']).toBe(Methods.AudioLibraryGetAlbums);
      expect(body['params']).toEqual({ limits: { start: 0 } });
    });

    it('omite params cuando no los hay', () => {
      service.query(Methods.PlayerGetActivePlayers).subscribe();

      expect('params' in sent()).toBeFalse();
    });

    it('devuelve el resultado ya desenvuelto', () => {
      let result: unknown;
      service.query(Methods.AudioLibraryGetGenres).subscribe(value => (result = value));

      httpMock.expectOne(JSON_RPC_URL).flush({
        id: 1,
        jsonrpc: '2.0',
        result: { genres: [] }
      });

      expect(result).toEqual({ genres: [] });
    });

    it('propaga el rechazo de Kodi, que llega con HTTP 200', () => {
      let caught: Error | undefined;
      service
        .query(Methods.AudioLibraryGetGenres)
        .subscribe({ error: (err: Error) => (caught = err) });

      httpMock.expectOne(JSON_RPC_URL).flush({
        id: 1,
        jsonrpc: '2.0',
        error: { code: -32601, message: 'Method not found' }
      });

      expect(caught?.message).toContain('Method not found');
    });
  });

  describe('command', () => {
    it('completa cuando Kodi acepta', () => {
      let completed = false;
      service
        .command(Methods.PlaylistClear, { playlistid: 0 })
        .subscribe({ complete: () => (completed = true) });

      sent();

      expect(completed).toBeTrue();
    });

    it('no exige resultado', () => {
      let completed = false;
      service.command(Methods.PlaylistClear).subscribe({ complete: () => (completed = true) });

      httpMock.expectOne(JSON_RPC_URL).flush({ id: 1, jsonrpc: '2.0' });

      expect(completed).toBeTrue();
    });

    it('propaga el rechazo', () => {
      let caught: Error | undefined;
      service.command(Methods.PlaylistClear).subscribe({ error: (err: Error) => (caught = err) });

      httpMock.expectOne(JSON_RPC_URL).flush({
        id: 1,
        jsonrpc: '2.0',
        error: { code: -32100, message: 'Failed to execute' }
      });

      expect(caught?.message).toContain('Failed to execute');
    });
  });

  it('numera cada petición, sin repetir entre llamadas', () => {
    // Antes cada repositorio llevaba su propio contador desde 1, asi que dos
    // peticiones simultaneas de repositorios distintos compartian id.
    service.query(Methods.AudioLibraryGetAlbums).subscribe();
    const first = sent()['id'] as number;

    service.query(Methods.AudioLibraryGetArtists).subscribe();
    const second = sent()['id'] as number;

    expect(second).toBe(first + 1);
  });

  it('acepta un sufijo de URL, que el mando necesita', () => {
    service
      .command(Methods.ApplicationSetVolume, {}, { urlSuffix: '?mediaplayer' })
      .subscribe();

    expect(sent(`${JSON_RPC_URL}?mediaplayer`)['method']).toBe(
      Methods.ApplicationSetVolume
    );
  });
});
