import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { BehaviorSubject, Subject, of } from 'rxjs';

import { PlaybackFacade } from './playback.facade';
import {
  PlayerWebSocketAdapter,
  SetVolumeUseCase,
  TogglePartyModeUseCase
} from '@domains/music/player';
import { GetPlaylistUseCase } from '@domains/music/playlist';

const EMPTY_STATE = { volume: 0, muted: false } as never;

describe('PlaybackFacade', () => {
  let facade: PlaybackFacade;
  let state$: BehaviorSubject<unknown>;
  let track$: BehaviorSubject<unknown>;
  let playlistChanged$: Subject<string>;
  let adapter: {
    getStateStream: () => unknown;
    getCurrentTrackStream: () => unknown;
    getPlaylistChangedStream: () => unknown;
    connect: jasmine.Spy;
    disconnect: jasmine.Spy;
  };
  let setVolume: { execute: jasmine.Spy };
  let getPlaylist: { execute: jasmine.Spy };
  let togglePartyMode: { execute: jasmine.Spy };

  beforeEach(() => {
    state$ = new BehaviorSubject<unknown>(EMPTY_STATE);
    track$ = new BehaviorSubject<unknown>(null);
    playlistChanged$ = new Subject<string>();

    adapter = {
      getStateStream: () => state$,
      getCurrentTrackStream: () => track$,
      getPlaylistChangedStream: () => playlistChanged$,
      connect: jasmine.createSpy('connect'),
      disconnect: jasmine.createSpy('disconnect')
    };
    setVolume = { execute: jasmine.createSpy('execute').and.returnValue(of('OK')) };
    getPlaylist = {
      execute: jasmine
        .createSpy('execute')
        .and.returnValue(of({ items: [{ id: 1 }], total: 1 }))
    };
    togglePartyMode = {
      execute: jasmine.createSpy('execute').and.returnValue(of(void 0))
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: PlayerWebSocketAdapter, useValue: adapter },
        { provide: SetVolumeUseCase, useValue: setVolume },
        { provide: GetPlaylistUseCase, useValue: getPlaylist },
        { provide: TogglePartyModeUseCase, useValue: togglePartyMode }
      ]
    });

    facade = TestBed.inject(PlaybackFacade);
  });

  it('parte de volumen cero y sin silenciar cuando no hay estado', () => {
    state$.next(null);

    expect(facade.volume()).toBe(0);
    expect(facade.isMute()).toBeFalse();
  });

  it('refleja el volumen y el silencio que llegan de Kodi', () => {
    state$.next({ volume: 42, muted: true } as never);

    expect(facade.volume()).toBe(42);
    expect(facade.isMute()).toBeTrue();
  });

  it('carga la cola al arrancar, sin esperar a que cambie', () => {
    // Sin el startWith, la cola quedaria vacia hasta que alguien la tocara.
    expect(getPlaylist.execute).toHaveBeenCalledTimes(1);
    expect(facade.getPlaylist().length).toBe(1);
  });

  it('vuelve a pedir la cola cuando Kodi avisa de un cambio', () => {
    playlistChanged$.next('add');

    expect(getPlaylist.execute).toHaveBeenCalledTimes(2);
  });

  it('expone los elementos de la cola sin el total', () => {
    expect(facade.getPlaylist()).toEqual([{ id: 1 }] as never);
  });

  it('conectar y desconectar van al adaptador', () => {
    facade.connect();
    facade.disconnect();

    expect(adapter.connect).toHaveBeenCalledWith();
    expect(adapter.disconnect).toHaveBeenCalledWith();
  });

  it('soltar la conexión desconecta', () => {
    facade.unsubscribe();

    expect(adapter.disconnect).toHaveBeenCalledWith();
  });

  it('cambiar el volumen llega a Kodi', () => {
    facade.updateVolume(70);

    expect(setVolume.execute).toHaveBeenCalledWith(70);
  });

  it('el modo fiesta llega a Kodi', () => {
    facade.togglePartyMode();

    expect(togglePartyMode.execute).toHaveBeenCalledWith();
  });
});
