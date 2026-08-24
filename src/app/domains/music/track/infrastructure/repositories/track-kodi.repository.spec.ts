import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';

import { TrackKodiRepository } from './track-kodi.repository';
import { KodiRpcService } from '@shared/services/kodi-rpc.service';
import { Methods } from '@shared/enums/methods';

describe('TrackKodiRepository', () => {
  let repository: TrackKodiRepository;
  let rpc: jasmine.SpyObj<KodiRpcService>;

  beforeEach(() => {
    rpc = jasmine.createSpyObj<KodiRpcService>('KodiRpcService', ['query', 'command']);
    rpc.command.and.returnValue(of(void 0));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: KodiRpcService, useValue: rpc }
      ]
    });

    repository = TestBed.inject(TrackKodiRepository);
  });

  function sent(): [string, Record<string, unknown>] {
    const args = rpc.command.calls.mostRecent().args;
    return [args[0] as string, args[1] as Record<string, unknown>];
  }

  it('reproduce en el acto abriendo el reproductor', () => {
    repository.addToPlaylist(7, true).subscribe();

    expect(sent()).toEqual([Methods.PlayerOpen, { item: { songid: 7 } }]);
  });

  it('encola sin reproducir cuando no se pide lo contrario', () => {
    // Son metodos distintos de Kodi: uno interrumpe lo que suena y el otro no.
    repository.addToPlaylist(7, false).subscribe();

    expect(sent()).toEqual([
      Methods.PlaylistAdd,
      { playlistid: 0, item: { songid: 7 } }
    ]);
  });

  it('reproduce una pista suelta', () => {
    repository.playTrack(9).subscribe();

    expect(sent()).toEqual([Methods.PlayerOpen, { item: { songid: 9 } }]);
  });

  describe('updateSong', () => {
    it('traduce los nombres del dominio a los de la API', () => {
      repository
        .updateSong(3, { trackNumber: 5, discTitle: 'Cara B', musicBrainzTrackId: 'mb' })
        .subscribe();

      expect(sent()[1]).toEqual({
        songid: 3,
        track: 5,
        disctitle: 'Cara B',
        musicbrainztrackid: 'mb'
      });
    });

    it('no envía los campos ausentes del patch', () => {
      repository.updateSong(3, { title: 'Kid A' }).subscribe();

      expect(Object.keys(sent()[1]).sort()).toEqual(['songid', 'title']);
    });

    it('envía null, que es como se borra un valor', () => {
      repository.updateSong(3, { genres: null }).subscribe();

      expect(sent()[1]['genre']).toBeNull();
    });

    it('propaga el fallo', () => {
      rpc.command.and.returnValue(throwError(() => new Error('Kodi dijo que no')));
      let caught: Error | undefined;

      repository.updateSong(3, { title: 'X' }).subscribe({
        error: (err: Error) => (caught = err)
      });

      expect(caught?.message).toBe('Kodi dijo que no');
    });
  });
});
