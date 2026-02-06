import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, EMPTY } from 'rxjs';

import { PlaybackFacade } from './playback.facade';
import { PlayerWebSocketAdapter, SetVolumeUseCase, TogglePartyModeUseCase } from '@domains/music/player';
import { GetPlaylistUseCase } from '@domains/music/playlist';

describe('PlaybackFacadeService', () => {
  let service: PlaybackFacade;

  const mockPlayerWebSocketAdapter = {
    getPlaylistChangedStream: () => EMPTY,
    getStateStream: () => EMPTY,
    getCurrentTrackStream: () => EMPTY,
    connect: jasmine.createSpy('connect'),
    disconnect: jasmine.createSpy('disconnect')
  };

  const mockSetVolumeUseCase = {
    execute: jasmine.createSpy('execute').and.returnValue(of('OK'))
  };

  const mockGetPlaylistUseCase = {
    execute: jasmine.createSpy('execute').and.returnValue(of({ items: [], total: 0 }))
  };

  const mockTogglePartyModeUseCase = {
    execute: jasmine.createSpy('execute').and.returnValue(of(void 0))
  };

  beforeEach(() => {
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
