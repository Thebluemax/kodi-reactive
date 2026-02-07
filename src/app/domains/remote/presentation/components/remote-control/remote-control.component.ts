// ==========================================================================
// PRESENTATION - Remote Control Component
// ==========================================================================

import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RangeCustomEvent } from '@ionic/angular';
import { IonButton, IonIcon, IonRange, IonMenuToggle } from '@ionic/angular/standalone';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NavigateUpUseCase } from '../../../application/use-cases/navigate-up.use-case';
import { NavigateDownUseCase } from '../../../application/use-cases/navigate-down.use-case';
import { NavigateLeftUseCase } from '../../../application/use-cases/navigate-left.use-case';
import { NavigateRightUseCase } from '../../../application/use-cases/navigate-right.use-case';
import { SelectUseCase } from '../../../application/use-cases/select.use-case';
import { BackUseCase } from '../../../application/use-cases/back.use-case';
import { GoHomeUseCase } from '../../../application/use-cases/go-home.use-case';
import { ContextMenuUseCase } from '../../../application/use-cases/context-menu.use-case';
import { ShowInfoUseCase } from '../../../application/use-cases/show-info.use-case';
import {
  PlayPauseUseCase,
  NextTrackUseCase,
  PreviousTrackUseCase,
  PlayerRepository,
  SetShuffleUseCase,
  SetRepeatUseCase,
  TogglePartyModeUseCase,
  PlayerWebSocketAdapter,
  PlayerState,
  CurrentTrack,
  SeekUseCase,
  RepeatMode
} from '@domains/music/player';
import { AssetsPipe } from '@shared/pipes/assets.pipe';
import { ArrayToStringPipe } from '@shared/pipes/array-to-string.pipe';
import { ZeroPaddingPipe } from '@shared/pipes/zero-padding.pipe';

@Component({
  selector: 'app-remote-control',
  templateUrl: './remote-control.component.html',
  styleUrls: ['./remote-control.component.scss'],
  imports: [IonButton, IonIcon, IonRange, IonMenuToggle, AssetsPipe, ArrayToStringPipe, ZeroPaddingPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemoteControlComponent implements OnInit, OnDestroy {
  // Navigation Use Cases
  private readonly navigateUpUseCase = inject(NavigateUpUseCase);
  private readonly navigateDownUseCase = inject(NavigateDownUseCase);
  private readonly navigateLeftUseCase = inject(NavigateLeftUseCase);
  private readonly navigateRightUseCase = inject(NavigateRightUseCase);
  private readonly selectUseCase = inject(SelectUseCase);
  private readonly backUseCase = inject(BackUseCase);
  private readonly goHomeUseCase = inject(GoHomeUseCase);
  private readonly contextMenuUseCase = inject(ContextMenuUseCase);
  private readonly showInfoUseCase = inject(ShowInfoUseCase);

  // Player Use Cases (from music domain)
  private readonly playPauseUseCase = inject(PlayPauseUseCase);
  private readonly nextTrackUseCase = inject(NextTrackUseCase);
  private readonly previousTrackUseCase = inject(PreviousTrackUseCase);
  private readonly playerRepository = inject(PlayerRepository);
  private readonly setShuffleUseCase = inject(SetShuffleUseCase);
  private readonly setRepeatUseCase = inject(SetRepeatUseCase);
  private readonly togglePartyModeUseCase = inject(TogglePartyModeUseCase);
  private readonly seekUseCase = inject(SeekUseCase);
  private readonly wsAdapter = inject(PlayerWebSocketAdapter);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly assetsPipe = new AssetsPipe();

  private readonly destroy$ = new Subject<void>();
  private isSeeking = false;
  private frozenPercentage = 0;

  state: PlayerState | null = null;
  currentTrack: CurrentTrack | null = null;

  ngOnInit(): void {
    this.wsAdapter.getStateStream()
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.state = state;
        this.cdr.markForCheck();
      });

    this.wsAdapter.getCurrentTrackStream()
      .pipe(takeUntil(this.destroy$))
      .subscribe(track => {
        this.currentTrack = track;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ========================================================================
  // Navigation Actions
  // ========================================================================

  onNavigateUp(): void {
    this.navigateUpUseCase.execute().subscribe();
  }

  onNavigateDown(): void {
    this.navigateDownUseCase.execute().subscribe();
  }

  onNavigateLeft(): void {
    this.navigateLeftUseCase.execute().subscribe();
  }

  onNavigateRight(): void {
    this.navigateRightUseCase.execute().subscribe();
  }

  onSelect(): void {
    this.selectUseCase.execute().subscribe();
  }

  // ========================================================================
  // Auxiliary Actions
  // ========================================================================

  onBack(): void {
    this.backUseCase.execute().subscribe();
  }

  onGoHome(): void {
    this.goHomeUseCase.execute().subscribe();
  }

  onContextMenu(): void {
    this.contextMenuUseCase.execute().subscribe();
  }

  onShowInfo(): void {
    this.showInfoUseCase.execute().subscribe();
  }

  // ========================================================================
  // Playback Actions (reusing music player domain)
  // ========================================================================

  onPlayPause(): void {
    this.playPauseUseCase.execute().subscribe();
  }

  onStop(): void {
    this.playerRepository.stop().subscribe();
  }

  onPrevious(): void {
    this.previousTrackUseCase.execute().subscribe();
  }

  onNext(): void {
    this.nextTrackUseCase.execute().subscribe();
  }

  // ========================================================================
  // Seek Actions
  // ========================================================================

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

  get backgroundImage(): string {
    const src = this.currentTrack?.fanart || this.currentTrack?.thumbnail || '';
    if (!src) return '';
    return this.assetsPipe.transform(src);
  }

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
