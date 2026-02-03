// ==========================================================================
// PRESENTATION - Remote Control Component
// ==========================================================================

import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';

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
  PlayerRepository
} from '@domains/music/player';

@Component({
  selector: 'app-remote-control',
  templateUrl: './remote-control.component.html',
  styleUrls: ['./remote-control.component.scss'],
  imports: [IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemoteControlComponent {
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
}
