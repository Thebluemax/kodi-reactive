import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { TVShowKodiRepository } from './tvshow-kodi.repository';
import { TVShowUpdate } from '../../domain/entities/tvshow.entity';
import { KodiConfigService } from '@shared/services/kodi-config.service';
import { Methods } from '@shared/enums/methods';

const JSON_RPC_URL = 'http://localhost:8008/jsonrpc';

describe('TVShowKodiRepository', () => {
  let repository: TVShowKodiRepository;
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

    repository = TestBed.inject(TVShowKodiRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('updateTVShow', () => {
    function expectUpdateRequest(): Record<string, unknown> {
      const req = httpMock.expectOne(JSON_RPC_URL);
      const body = req.request.body as { method: string; params: Record<string, unknown> };

      expect(body.method).toBe(Methods.VideoLibrarySetTVShowDetails);

      req.flush({ id: 1, jsonrpc: '2.0', result: 'OK' });
      return body.params;
    }

    it('envía el tvshowid como identificador', () => {
      repository.updateTVShow(5, { title: 'Los Soprano' }).subscribe();

      expect(expectUpdateRequest()['tvshowid']).toBe(5);
    });

    it('traduce los nombres del dominio a los de la API', () => {
      const patch: TVShowUpdate = {
        originalTitle: 'The Sopranos',
        sortTitle: 'Soprano, Los',
        episodeGuide: 'https://guia',
        imdbNumber: 'tt0141842',
        userRating: 9
      };

      repository.updateTVShow(5, patch).subscribe();
      const params = expectUpdateRequest();

      expect(params['originaltitle']).toBe('The Sopranos');
      expect(params['sorttitle']).toBe('Soprano, Los');
      expect(params['episodeguide']).toBe('https://guia');
      expect(params['imdbnumber']).toBe('tt0141842');
      expect(params['userrating']).toBe(9);
    });

    it('envía el estado tal como lo nombra la API', () => {
      repository.updateTVShow(5, { status: 'ended' }).subscribe();

      expect(expectUpdateRequest()['status']).toBe('ended');
    });

    it('no envía los campos ausentes del patch', () => {
      repository.updateTVShow(5, { title: 'Los Soprano' }).subscribe();

      expect(Object.keys(expectUpdateRequest()).sort()).toEqual(['title', 'tvshowid']);
    });

    it('propaga el error del sobre, que llega con HTTP 200', () => {
      let caught: Error | undefined;
      repository.updateTVShow(5, { title: 'X' }).subscribe({
        error: (err: Error) => (caught = err)
      });

      httpMock.expectOne(JSON_RPC_URL).flush({
        id: 1,
        jsonrpc: '2.0',
        error: { code: -32602, message: 'Invalid params' }
      });

      expect(caught?.message).toContain('Invalid params');
    });
  });

  it('pide en el detalle todo lo que el editor sabe escribir', () => {
    repository.getTVShowById(5).subscribe();

    const req = httpMock.expectOne(JSON_RPC_URL);
    const body = req.request.body as { params: { properties: string[] } };

    expect(body.params.properties).toEqual(
      jasmine.arrayContaining([
        'originaltitle', 'sorttitle', 'premiered', 'votes', 'userrating',
        'mpaa', 'imdbnumber', 'episodeguide', 'status', 'runtime', 'tag', 'art'
      ])
    );
    req.flush({ id: 1, jsonrpc: '2.0', result: { tvshowdetails: { tvshowid: 5 } } });
  });

  it('pide en la lista solo lo que las tarjetas pintan', () => {
    repository.getTVShows({ start: 0, end: 40 }).subscribe();

    const req = httpMock.expectOne(JSON_RPC_URL);
    const body = req.request.body as { params: { properties: string[] } };

    expect(body.params.properties.sort()).toEqual(['fanart', 'genre', 'title', 'year']);
    req.flush({
      id: 1,
      jsonrpc: '2.0',
      result: { tvshows: [], limits: { start: 0, end: 0, total: 0 } }
    });
  });

  // ========================================================================
  // refreshTVShow
  // ========================================================================

  describe('refreshTVShow', () => {
    function expectRefreshRequest(): Record<string, unknown> {
      const req = httpMock.expectOne(JSON_RPC_URL);
      const body = req.request.body as { method: string; params: Record<string, unknown> };

      expect(body.method).toBe(Methods.VideoLibraryRefreshTVShow);

      req.flush({ id: 1, jsonrpc: '2.0', result: 'OK' });
      return body.params;
    }

    it('manda el título con el que buscar', () => {
      repository.refreshTVShow(5, { title: 'Los Soprano' }).subscribe();

      expect(expectRefreshRequest()['title']).toBe('Los Soprano');
    });

    it('no arrastra a los episodios salvo que se pida', () => {
      repository.refreshTVShow(5, {}).subscribe();

      expect(expectRefreshRequest()['refreshepisodes']).toBeFalse();
    });

    it('arrastra a los episodios cuando se pide', () => {
      repository.refreshTVShow(5, { refreshEpisodes: true }).subscribe();

      expect(expectRefreshRequest()['refreshepisodes']).toBeTrue();
    });

    it('propaga el fallo del scraper, que llega con HTTP 200', () => {
      let caught: Error | undefined;
      repository.refreshTVShow(5, {}).subscribe({ error: (err: Error) => (caught = err) });

      httpMock.expectOne(JSON_RPC_URL).flush({
        id: 1,
        jsonrpc: '2.0',
        error: { code: -32100, message: 'Scraper failed' }
      });

      expect(caught?.message).toContain('Scraper failed');
    });
  });
});
