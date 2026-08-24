import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';

import { PlayerControlComponent } from './player-control.component';
import {
  NextTrackUseCase,
  PlayPauseUseCase,
  PlayerWebSocketAdapter,
  PreviousTrackUseCase,
  SeekUseCase,
  SetRepeatUseCase,
  SetShuffleUseCase,
  TogglePartyModeUseCase
} from '@domains/music/player';

const PLAYING = {
  isPlaying: true,
  percentage: 30,
  canShuffle: true,
  canRepeat: true,
  shuffled: false,
  repeat: 'off',
  partyMode: false,
  currentTime: { hours: 0, minutes: 1, seconds: 5 },
  totalTime: { hours: 0, minutes: 3, seconds: 20 }
};

describe('PlayerControlComponent', () => {
  let fixture: ComponentFixture<PlayerControlComponent>;
  let component: PlayerControlComponent;
  let state$: BehaviorSubject<unknown>;
  let spies: Record<string, { execute: jasmine.Spy }>;

  beforeEach(async () => {
    state$ = new BehaviorSubject<unknown>(null);
    const useCase = (): { execute: jasmine.Spy } => ({
      execute: jasmine.createSpy('execute').and.returnValue(of(void 0))
    });

    spies = {
      playPause: useCase(),
      seek: useCase(),
      next: useCase(),
      previous: useCase(),
      shuffle: useCase(),
      repeat: useCase(),
      party: useCase()
    };

    await TestBed.configureTestingModule({
      imports: [PlayerControlComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: PlayerWebSocketAdapter, useValue: { getStateStream: () => state$ } },
        { provide: PlayPauseUseCase, useValue: spies['playPause'] },
        { provide: SeekUseCase, useValue: spies['seek'] },
        { provide: NextTrackUseCase, useValue: spies['next'] },
        { provide: PreviousTrackUseCase, useValue: spies['previous'] },
        { provide: SetShuffleUseCase, useValue: spies['shuffle'] },
        { provide: SetRepeatUseCase, useValue: spies['repeat'] },
        { provide: TogglePartyModeUseCase, useValue: spies['party'] }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('sin estado todavía', () => {
    it('no se cae y da valores neutros', () => {
      // El estado llega por WebSocket: hasta el primer mensaje no hay nada.
      expect(component.isPlaying).toBeFalse();
      expect(component.repeat).toBe('off');
      expect(component.seekDisplayPercentage).toBe(0);
      expect(component.currentMinutes).toBe(0);
    });
  });

  describe('con estado', () => {
    beforeEach(() => {
      state$.next(PLAYING as never);
      fixture.detectChanges();
    });

    it('refleja lo que Kodi está haciendo', () => {
      expect(component.isPlaying).toBeTrue();
      expect(component.canShuffle).toBeTrue();
      expect(component.seekDisplayPercentage).toBe(30);
    });

    it('desglosa el tiempo transcurrido y el total', () => {
      expect(component.currentMinutes).toBe(1);
      expect(component.currentSeconds).toBe(5);
      expect(component.totalHours).toBe(0);
    });
  });

  describe('arrastrar la barra de progreso', () => {
    beforeEach(() => {
      state$.next(PLAYING as never);
      fixture.detectChanges();
    });

    it('congela la posición mientras se arrastra', () => {
      // Sin congelarla, cada mensaje de Kodi devolveria el tirador a donde
      // esta la reproduccion y no se podria soltar donde uno quiere.
      component.onSeekStart();
      state$.next({ ...PLAYING, percentage: 55 } as never);
      fixture.detectChanges();

      expect(component.seekDisplayPercentage).toBe(30);
    });

    it('vuelve a seguir a Kodi al soltar', () => {
      component.onSeekStart();
      component.onSeekEnd(new CustomEvent('ionKnobMoveEnd', { detail: { value: 70 } }));

      state$.next({ ...PLAYING, percentage: 70 } as never);
      fixture.detectChanges();

      expect(component.seekDisplayPercentage).toBe(70);
    });

    it('manda la posición elegida', () => {
      component.onSeekEnd(new CustomEvent('ionKnobMoveEnd', { detail: { value: 70 } }));

      expect(spies['seek'].execute).toHaveBeenCalledWith(70);
    });
  });

  describe('acciones', () => {
    it('cada botón llama a lo suyo', () => {
      component.onPlayPause();
      component.onNext();
      component.onPrevious();
      component.onShuffle();
      component.onRepeat();
      component.onPartyMode();

      expect(spies['playPause'].execute).toHaveBeenCalledWith();
      expect(spies['next'].execute).toHaveBeenCalledWith();
      expect(spies['previous'].execute).toHaveBeenCalledWith();
      expect(spies['shuffle'].execute).toHaveBeenCalledWith();
      expect(spies['repeat'].execute).toHaveBeenCalledWith();
      expect(spies['party'].execute).toHaveBeenCalledWith();
    });
  });

  it('deja de escuchar al destruirse', () => {
    state$.next(PLAYING as never);
    fixture.detectChanges();

    fixture.destroy();
    state$.next({ ...PLAYING, isPlaying: false } as never);

    // Si la suscripcion siguiera viva, el estado habria cambiado a pausado.
    expect(component.isPlaying).toBeTrue();
  });
});
