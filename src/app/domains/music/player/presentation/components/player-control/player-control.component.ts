// ==========================================================================
// PRESENTATION - Player Control Component
// ==========================================================================

import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RangeCustomEvent, IonicModule } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PlayerState, RepeatMode } from '../../../domain/entities/player-state.entity';
import { PlayerWebSocketAdapter } from '../../../infrastructure/adapters/player-websocket.adapter';
import { PlayPauseUseCase } from '../../../application/use-cases/play-pause.use-case';
import { SeekUseCase } from '../../../application/use-cases/seek.use-case';
import { NextTrackUseCase } from '../../../application/use-cases/next-track.use-case';
import { PreviousTrackUseCase } from '../../../application/use-cases/previous-track.use-case';
import { SetShuffleUseCase } from '../../../application/use-cases/set-shuffle.use-case';
import { SetRepeatUseCase } from '../../../application/use-cases/set-repeat.use-case';
import { TogglePartyModeUseCase } from '../../../application/use-cases/toggle-party-mode.use-case';
import { ZeroPaddingPipe } from '@shared/pipes/zero-padding.pipe';

@Component({
  selector: 'app-player-control',
  templateUrl: './player-control.component.html',
  styleUrls: ['./player-control.component.scss'],
  imports: [IonicModule, ZeroPaddingPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerControlComponent implements OnInit, OnDestroy {
  private readonly wsAdapter = inject(PlayerWebSocketAdapter);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly playPauseUseCase = inject(PlayPauseUseCase);
  private readonly seekUseCase = inject(SeekUseCase);
  private readonly nextTrackUseCase = inject(NextTrackUseCase);
  private readonly previousTrackUseCase = inject(PreviousTrackUseCase);
  private readonly setShuffleUseCase = inject(SetShuffleUseCase);
  private readonly setRepeatUseCase = inject(SetRepeatUseCase);
  private readonly togglePartyModeUseCase = inject(TogglePartyModeUseCase);

  private readonly destroy$ = new Subject<void>();
  private isSeeking = false;
  private frozenPercentage = 0;

  state: PlayerState | null = null;

  ngOnInit(): void {
    this.wsAdapter.getStateStream()
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.state = state;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ========================================================================
  // Playback Control
  // ========================================================================

  onPlayPause(): void {
    this.playPauseUseCase.execute().subscribe();
  }

  onPrevious(): void {
    this.previousTrackUseCase.execute().subscribe();
  }

  onNext(): void {
    this.nextTrackUseCase.execute().subscribe();
  }

  onSeekStart(): void {
    this.isSeeking = true;
    this.frozenPercentage = this.state?.percentage ?? 0;
  }

  onSeekEnd(event: Event): void {
    const rangeEvent = event as RangeCustomEvent;
    const value = rangeEvent.detail.value as number;
    this.seekUseCase.execute(value).subscribe();
    this.isSeeking = false;
  }

  // ========================================================================
  // Mode Controls
  // ========================================================================

  onShuffle(): void {
    this.setShuffleUseCase.execute().subscribe();
  }

  onRepeat(): void {
    this.setRepeatUseCase.execute().subscribe();
  }

  onPartyMode(): void {
    this.togglePartyModeUseCase.execute().subscribe();
  }

  // ========================================================================
  // UI Helpers
  // ========================================================================

  get isPlaying(): boolean {
    return this.state?.isPlaying ?? false;
  }

  get canShuffle(): boolean {
    return this.state?.canShuffle ?? false;
  }

  get canRepeat(): boolean {
    return this.state?.canRepeat ?? false;
  }

  get shuffled(): boolean {
    return this.state?.shuffled ?? false;
  }

  get repeat(): RepeatMode {
    return this.state?.repeat ?? 'off';
  }

  get partyMode(): boolean {
    return this.state?.partyMode ?? false;
  }

  get seekDisplayPercentage(): number {
    if (this.isSeeking) return this.frozenPercentage;
    return this.state?.percentage ?? 0;
  }

  get currentHours(): number {
    return this.state?.currentTime?.hours ?? 0;
  }

  get currentMinutes(): number {
    return this.state?.currentTime?.minutes ?? 0;
  }

  get currentSeconds(): number {
    return this.state?.currentTime?.seconds ?? 0;
  }

  get totalHours(): number {
    return this.state?.totalTime?.hours ?? 0;
  }

  get totalMinutes(): number {
    return this.state?.totalTime?.minutes ?? 0;
  }

  get totalSeconds(): number {
    return this.state?.totalTime?.seconds ?? 0;
  }

  get showHours(): boolean {
    return this.totalHours > 0;
  }

  getRepeatColor(): string {
    switch (this.repeat) {
      case 'off':
        return 'dark';
      case 'all':
        return 'success';
      case 'one':
        return 'secondary';
      default:
        return 'dark';
    }
  }

  getRepeatIcon(): string {
    return this.repeat === 'one' ? 'repeat-outline' : 'repeat-outline';
  }
}
