import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { AlbumKodiRepository } from './album-kodi.repository';
import { AlbumUpdate } from '../../domain/entities/album.entity';
import { KodiConfigService } from '@shared/services/kodi-config.service';
import { Methods } from '@shared/enums/methods';

const JSON_RPC_URL = 'http://localhost:8008/jsonrpc';

describe('AlbumKodiRepository', () => {
  let repository: AlbumKodiRepository;
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

    repository = TestBed.inject(AlbumKodiRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ========================================================================
  // updateAlbum
  // ========================================================================

  describe('updateAlbum', () => {
    function expectUpdateRequest(): Record<string, unknown> {
      const req = httpMock.expectOne(JSON_RPC_URL);
      const body = req.request.body as { method: string; params: Record<string, unknown> };

      expect(body.method).toBe(Methods.AudioLibrarySetAlbumDetails);

      req.flush({ id: 1, jsonrpc: '2.0', result: 'OK' });
      return body.params;
    }

    it('envía el albumid como identificador', () => {
      repository.updateAlbum(7, { title: 'Kid A' }).subscribe();

      expect(expectUpdateRequest()['albumid']).toBe(7);
    });

    it('traduce los nombres del dominio a los de la API', () => {
      const patch: AlbumUpdate = {
        label: 'Parlophone',
        userRating: 9,
        musicBrainzAlbumId: 'abc-123',
        artists: ['Radiohead'],
        genres: ['Electronic']
      };

      repository.updateAlbum(7, patch).subscribe();
      const params = expectUpdateRequest();

      expect(params['albumlabel']).toBe('Parlophone');
      expect(params['userrating']).toBe(9);
      expect(params['musicbrainzalbumid']).toBe('abc-123');
      expect(params['artist']).toEqual(['Radiohead']);
      expect(params['genre']).toEqual(['Electronic']);
    });

    it('no envía los campos ausentes del patch', () => {
      repository.updateAlbum(7, { title: 'Amnesiac' }).subscribe();
      const params = expectUpdateRequest();

      expect(Object.keys(params).sort()).toEqual(['albumid', 'title']);
    });

    it('envía null, que es como se borra un valor', () => {
      repository.updateAlbum(7, { genres: null }).subscribe();
      const params = expectUpdateRequest();

      expect(params['genre']).toBeNull();
      expect('genre' in params).toBeTrue();
    });

    it('pide el artwork entre las propiedades del detalle', () => {
      repository.getAlbumById(7).subscribe();

      const req = httpMock.expectOne(JSON_RPC_URL);
      const body = req.request.body as { params: { properties: string[] } };

      expect(body.params.properties).toContain('art');
      req.flush({ id: 1, jsonrpc: '2.0', result: { albumdetails: { albumid: 7 } } });
    });

    it('pasa el artwork tal cual, incluidas las claves no nombradas', () => {
      repository.updateAlbum(7, {
        art: { thumb: 'http://host/cover.jpg', clearlogo: null }
      }).subscribe();

      expect(expectUpdateRequest()['art']).toEqual({
        thumb: 'http://host/cover.jpg',
        clearlogo: null
      });
    });

    it('completa sin valor cuando Kodi acepta', () => {
      let completed = false;
      repository.updateAlbum(7, { title: 'Kid A' }).subscribe({ complete: () => (completed = true) });

      expectUpdateRequest();

      expect(completed).toBeTrue();
    });

    it('propaga el error del sobre, que llega con HTTP 200', () => {
      let caught: Error | undefined;
      repository.updateAlbum(7, { title: 'Kid A' }).subscribe({
        error: (err: Error) => (caught = err)
      });

      httpMock.expectOne(JSON_RPC_URL).flush({
        id: 1,
        jsonrpc: '2.0',
        error: { code: -32602, message: 'Invalid params' }
      });

      expect(caught).toBeDefined();
      expect(caught?.message).toContain('Invalid params');
      expect(caught?.message).toContain('-32602');
    });
  });
});
