// ==========================================================================
// PRESENTATION - Track Item Component
// ==========================================================================

import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { IonItem, IonLabel, IonNote, IonButtons, IonButton, IonIcon } from '@ionic/angular/standalone';
import { Track } from '../../../domain/entities/track.entity';
import { SecondsToStringPipe } from '@shared/pipes/seconds-to-string.pipe';
import { AddTrackToPlaylistUseCase } from '../../../application/use-cases/add-track-to-playlist.use-case';
import { PlayTrackUseCase } from '../../../application/use-cases/play-track.use-case';
import { NotificationService } from '@shared/services/notification.service';

@Component({
  selector: 'app-track-item',
  standalone: true,
  imports: [
    IonItem,
    IonLabel,
    IonNote,
    IonButtons,
    IonButton,
    IonIcon,
    SecondsToStringPipe
  ],
  templateUrl: './track-item.component.html',
  styleUrl: './track-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrackItemComponent {
  private readonly notifications = inject(NotificationService);
  private readonly addTrackToPlaylistUseCase = inject(AddTrackToPlaylistUseCase);
  private readonly playTrackUseCase = inject(PlayTrackUseCase);

  // Inputs using signals
  readonly track = input.required<Track>();

  // Outputs using output()
  readonly trackPlayed = output<Track>();

  onPlay(): void {
    const track = this.track();
    this.playTrackUseCase.execute(track.songId).subscribe({
      next: () => {
        this.trackPlayed.emit(track);
      },
      error: () => void this.notifications.error('No se ha podido reproducir la pista')
    });
  }

  onAddToPlaylist(): void {
    const track = this.track();
    this.addTrackToPlaylistUseCase.execute(track.songId, false).subscribe({
      error: () => void this.notifications.error('No se ha podido añadir la pista a la cola')
    });
  }
}
