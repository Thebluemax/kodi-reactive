import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { MovieKodiRepository } from './movie-kodi.repository';
import { MovieUpdate } from '../../domain/entities/movie.entity';
import { KodiConfigService } from '@shared/services/kodi-config.service';
import { Methods } from '@shared/enums/methods';

const JSON_RPC_URL = 'http://localhost:8008/jsonrpc';

describe('MovieKodiRepository', () => {
  let repository: MovieKodiRepository;
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

    repository = TestBed.inject(MovieKodiRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('updateMovie', () => {
    function expectUpdateRequest(): Record<string, unknown> {
      const req = httpMock.expectOne(JSON_RPC_URL);
      const body = req.request.body as { method: string; params: Record<string, unknown> };

      expect(body.method).toBe(Methods.VideoLibrarySetMovieDetails);

      req.flush({ id: 1, jsonrpc: '2.0', result: 'OK' });
      return body.params;
    }

    it('envía el movieid como identificador', () => {
      repository.updateMovie(11, { title: 'El Padrino' }).subscribe();

      expect(expectUpdateRequest()['movieid']).toBe(11);
    });

    it('traduce los nombres del dominio a los de la API', () => {
      const patch: MovieUpdate = {
        originalTitle: 'The Godfather',
        sortTitle: 'Padrino, El',
        plotOutline: 'Ascenso de Michael',
        imdbNumber: 'tt0068646',
        userRating: 10
      };

      repository.updateMovie(11, patch).subscribe();
      const params = expectUpdateRequest();

      expect(params['originaltitle']).toBe('The Godfather');
      expect(params['sorttitle']).toBe('Padrino, El');
      expect(params['plotoutline']).toBe('Ascenso de Michael');
      expect(params['imdbnumber']).toBe('tt0068646');
      expect(params['userrating']).toBe(10);
    });

    it('envía el identificador único, que el editor no expone', () => {
      // Escribirlo antes de un re-scrapeo es lo que desambigua dos peliculas
      // homonimas: el scraper lo respeta en vez de volver a buscar por titulo.
      repository.updateMovie(11, { uniqueId: { imdb: 'tt0068646' } }).subscribe();

      expect(expectUpdateRequest()['uniqueid']).toEqual({ imdb: 'tt0068646' });
    });

    it('envía los votos como cadena', () => {
      // Optional.String para pelicula, a diferencia de album.
      repository.updateMovie(11, { votes: '1.900.000' }).subscribe();

      expect(expectUpdateRequest()['votes']).toBe('1.900.000');
    });

    it('no envía los campos ausentes del patch', () => {
      repository.updateMovie(11, { title: 'El Padrino' }).subscribe();

      expect(Object.keys(expectUpdateRequest()).sort()).toEqual(['movieid', 'title']);
    });

    it('propaga el error del sobre, que llega con HTTP 200', () => {
      let caught: Error | undefined;
      repository.updateMovie(11, { title: 'X' }).subscribe({
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
    repository.getMovieById(11).subscribe();

    const req = httpMock.expectOne(JSON_RPC_URL);
    const body = req.request.body as { params: { properties: string[] } };

    expect(body.params.properties).toEqual(
      jasmine.arrayContaining([
        'originaltitle', 'sorttitle', 'plotoutline', 'premiered', 'votes',
        'top250', 'mpaa', 'imdbnumber', 'trailer', 'set', 'tag', 'art'
      ])
    );
    req.flush({ id: 1, jsonrpc: '2.0', result: { moviedetails: { movieid: 11 } } });
  });

  it('pide en la lista solo lo que las tarjetas pintan', () => {
    repository.getMovies({ start: 0, end: 40 }).subscribe();

    const req = httpMock.expectOne(JSON_RPC_URL);
    const body = req.request.body as { params: { properties: string[] } };

    expect(body.params.properties.sort()).toEqual(['fanart', 'genre', 'title', 'year']);
    req.flush({
      id: 1,
      jsonrpc: '2.0',
      result: { movies: [], limits: { start: 0, end: 0, total: 0 } }
    });
  });

  // ========================================================================
  // refreshMovie
  // ========================================================================

  describe('refreshMovie', () => {
    function expectRefreshRequest(): Record<string, unknown> {
      const req = httpMock.expectOne(JSON_RPC_URL);
      const body = req.request.body as { method: string; params: Record<string, unknown> };

      expect(body.method).toBe(Methods.VideoLibraryRefreshMovie);

      req.flush({ id: 1, jsonrpc: '2.0', result: 'OK' });
      return body.params;
    }

    it('manda el título con el que buscar en vez del nombre del archivo', () => {
      repository.refreshMovie(11, { title: 'El Padrino' }).subscribe();

      expect(expectRefreshRequest()['title']).toBe('El Padrino');
    });

    it('recorta el título, que viene de un campo de texto', () => {
      repository.refreshMovie(11, { title: '  El Padrino  ' }).subscribe();

      expect(expectRefreshRequest()['title']).toBe('El Padrino');
    });

    it('sin título manda cadena vacía, que es «dedúcelo del archivo»', () => {
      repository.refreshMovie(11, {}).subscribe();
      const params = expectRefreshRequest();

      expect(params['title']).toBe('');
      expect(params['ignorenfo']).toBeFalse();
    });

    it('traslada la opción de ignorar el NFO', () => {
      repository.refreshMovie(11, { ignoreNfo: true }).subscribe();

      expect(expectRefreshRequest()['ignorenfo']).toBeTrue();
    });

    it('propaga el fallo del scraper, que llega con HTTP 200', () => {
      let caught: Error | undefined;
      repository.refreshMovie(11, {}).subscribe({ error: (err: Error) => (caught = err) });

      httpMock.expectOne(JSON_RPC_URL).flush({
        id: 1,
        jsonrpc: '2.0',
        error: { code: -32100, message: 'Scraper failed' }
      });

      expect(caught?.message).toContain('Scraper failed');
    });
  });
});
