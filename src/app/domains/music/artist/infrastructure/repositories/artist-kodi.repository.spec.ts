import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { ArtistKodiRepository } from './artist-kodi.repository';
import { ArtistUpdate } from '../../domain/entities/artist.entity';
import { KodiConfigService } from '@shared/services/kodi-config.service';
import { Methods } from '@shared/enums/methods';

const JSON_RPC_URL = 'http://localhost:8008/jsonrpc';

describe('ArtistKodiRepository', () => {
  let repository: ArtistKodiRepository;
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

    repository = TestBed.inject(ArtistKodiRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('updateArtist', () => {
    function expectUpdateRequest(): Record<string, unknown> {
      const req = httpMock.expectOne(JSON_RPC_URL);
      const body = req.request.body as { method: string; params: Record<string, unknown> };

      expect(body.method).toBe(Methods.AudioLibrarySetArtistDetails);

      req.flush({ id: 1, jsonrpc: '2.0', result: 'OK' });
      return body.params;
    }

    it('envía el artistid como identificador', () => {
      repository.updateArtist(3, { name: 'Radiohead' }).subscribe();

      expect(expectUpdateRequest()['artistid']).toBe(3);
    });

    it('traduce los nombres del dominio a los de la API', () => {
      const patch: ArtistUpdate = {
        name: 'Radiohead',
        instruments: ['Guitar'],
        yearsActive: ['1985-'],
        sortName: 'Radiohead',
        disambiguation: 'banda británica'
      };

      repository.updateArtist(3, patch).subscribe();
      const params = expectUpdateRequest();

      expect(params['artist']).toBe('Radiohead');
      expect(params['instrument']).toEqual(['Guitar']);
      expect(params['yearsactive']).toEqual(['1985-']);
      expect(params['sortname']).toBe('Radiohead');
      expect(params['disambiguation']).toBe('banda británica');
    });

    it('envía MusicBrainz como cadena, no como lista', () => {
      // La API lo lee como Array.String pero solo admite escribir Optional.String.
      repository.updateArtist(3, { musicBrainzId: 'mb-1' }).subscribe();

      expect(expectUpdateRequest()['musicbrainzartistid']).toBe('mb-1');
    });

    it('no envía los campos ausentes del patch', () => {
      repository.updateArtist(3, { name: 'Radiohead' }).subscribe();

      expect(Object.keys(expectUpdateRequest()).sort()).toEqual(['artist', 'artistid']);
    });

    it('propaga el error del sobre, que llega con HTTP 200', () => {
      let caught: Error | undefined;
      repository.updateArtist(3, { name: 'X' }).subscribe({
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
    repository.getArtistById(3).subscribe();

    const req = httpMock.expectOne(JSON_RPC_URL);
    const body = req.request.body as { params: { properties: string[] } };

    expect(body.params.properties).toEqual(
      jasmine.arrayContaining(['sortname', 'type', 'gender', 'disambiguation', 'art'])
    );
    req.flush({ id: 1, jsonrpc: '2.0', result: { artistdetails: { artistid: 3 } } });
  });
});
