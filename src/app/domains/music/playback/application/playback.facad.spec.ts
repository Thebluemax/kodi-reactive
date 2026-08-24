import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, EMPTY } from 'rxjs';

import { PlaybackFacade } from './playback.facade';
import { PlayerWebSocketAdapter, SetVolumeUseCase, TogglePartyModeUseCase } from '@domains/music/player';
import { GetPlaylistUseCase } from '@domains/music/playlist';

describe('PlaybackFacadeService', () => {
  let service: PlaybackFacade;

  // Los espias se crean por test: compartirlos entre ellos hace que el orden
  // de ejecucion importe.
  let mockPlayerWebSocketAdapter: Record<string, unknown>;
  let mockSetVolumeUseCase: { execute: jasmine.Spy };
  let mockGetPlaylistUseCase: { execute: jasmine.Spy };
  let mockTogglePartyModeUseCase: { execute: jasmine.Spy };

  beforeEach(() => {
    mockPlayerWebSocketAdapter = {
      getPlaylistChangedStream: () => EMPTY,
      getStateStream: () => EMPTY,
      getCurrentTrackStream: () => EMPTY,
      connect: jasmine.createSpy('connect'),
      disconnect: jasmine.createSpy('disconnect')
    };

    mockSetVolumeUseCase = {
      execute: jasmine.createSpy('execute').and.returnValue(of('OK'))
    };

    mockGetPlaylistUseCase = {
      execute: jasmine.createSpy('execute').and.returnValue(of({ items: [], total: 0 }))
    };

    mockTogglePartyModeUseCase = {
      execute: jasmine.createSpy('execute').and.returnValue(of(void 0))
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: PlayerWebSocketAdapter, useValue: mockPlayerWebSocketAdapter },
        { provide: SetVolumeUseCase, useValue: mockSetVolumeUseCase },
        { provide: GetPlaylistUseCase, useValue: mockGetPlaylistUseCase },
        { provide: TogglePartyModeUseCase, useValue: mockTogglePartyModeUseCase }
      ]
    });
    service = TestBed.inject(PlaybackFacade);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
