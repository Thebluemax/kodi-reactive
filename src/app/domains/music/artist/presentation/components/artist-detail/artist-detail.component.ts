// ==========================================================================
// PRESENTATION - Artist Detail Component
// ==========================================================================

import { Component, inject, input, output, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { Artist, ArtistAlbumGroup } from '../../../domain/entities/artist.entity';
import { Track } from '@domains/music/track/domain/entities/track.entity';
import { PlayTrackUseCase, AddTrackToPlaylistUseCase } from '@domains/music/track';
import { AddArtistToPlaylistUseCase } from '../../../application/use-cases/add-artist-to-playlist.use-case';
import { AddAlbumToPlaylistUseCase } from '@domains/music/album';
import { AssetsPipe } from '@shared/pipes/assets.pipe';
import { ArrayToStringPipe } from '@shared/pipes/array-to-string.pipe';
import { SecondsToStringPipe } from '@shared/pipes/seconds-to-string.pipe';
import { NotificationService } from '@shared/services/notification.service';

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [
    IonicModule,
    AssetsPipe,
    ArrayToStringPipe,
    SecondsToStringPipe
  ],
  templateUrl: './artist-detail.component.html',
  styleUrls: ['./artist-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtistDetailComponent {
  private readonly notifications = inject(NotificationService);
  private readonly addArtistToPlaylistUseCase = inject(AddArtistToPlaylistUseCase);
  private readonly playTrackUseCase = inject(PlayTrackUseCase);
  private readonly addTrackToPlaylistUseCase = inject(AddTrackToPlaylistUseCase);
  private readonly addAlbumToPlaylistUseCase = inject(AddAlbumToPlaylistUseCase);

  // Inputs (signal-based)
  artist = input<Artist | null>(null);
  albums = input<ArtistAlbumGroup[]>([]);

  // Outputs (signal-based)
  trackSelected = output<Track>();
  albumSelected = output<number>();
  /**
   * El modal no se monta aqui: este componente vive dentro del cajon lateral,
   * que se saca a si mismo a document.body. Lo presenta el contenedor.
   */
  editRequested = output<Artist>();

  onPlayTrack(track: Track): void {
    this.playTrackUseCase.execute(track.songId).subscribe({
      next: () => {
        this.trackSelected.emit(track);
      },
      error: () => void this.notifications.error('No se ha podido reproducir la pista')
    });
  }

  onAddTrackToPlaylist(track: Track): void {
    this.addTrackToPlaylistUseCase.execute(track.songId, false).subscribe({
      error: () => void this.notifications.error('No se ha podido añadir la pista a la cola')
    });
  }

  onPlayAlbum(albumId: number): void {
    this.addAlbumToPlaylistUseCase.execute(albumId, true).subscribe({
      next: () => this.albumSelected.emit(albumId),
      error: () => void this.notifications.error('No se ha podido reproducir el álbum')
    });
  }

  onAddAlbumToPlaylist(albumId: number): void {
    this.addAlbumToPlaylistUseCase.execute(albumId, false).subscribe({
      error: () => void this.notifications.error('No se ha podido añadir el álbum a la cola')
    });
  }

  onPlayArtist(): void {
    const artist = this.artist();
    if (!artist) return;
    this.addArtistToPlaylistUseCase
      .execute(artist.artistId, true)
      .subscribe({
      error: () => void this.notifications.error('No se ha podido reproducir el artista')
      });
  }

  onAddArtistToPlaylist(): void {
    const artist = this.artist();
    if (!artist) return;
    this.addArtistToPlaylistUseCase
      .execute(artist.artistId, false)
      .subscribe({
      error: () => void this.notifications.error('No se ha podido añadir el artista a la cola')
      });
  }
}
