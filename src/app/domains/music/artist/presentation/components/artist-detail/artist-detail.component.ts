// ==========================================================================
// PRESENTATION - Artist Detail Component
// ==========================================================================

import { Component, inject, input, output } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { Artist, ArtistAlbumGroup } from '../../../domain/entities/artist.entity';
import { Track } from '@domains/music/track/domain/entities/track.entity';
import { AddArtistToPlaylistUseCase } from '../../../application/use-cases/add-artist-to-playlist.use-case';
import { PlayTrackUseCase } from '../../../application/use-cases/play-track.use-case';
import { AddTrackToPlaylistUseCase } from '../../../application/use-cases/add-track-to-playlist.use-case';
import { AddAlbumToPlaylistUseCase } from '@domains/music/album';
import { AssetsPipe } from '@shared/pipes/assets.pipe';
import { ArrayToStringPipe } from '@shared/pipes/array-to-string.pipe';
import { SecondsToStringPipe } from '@shared/pipes/seconds-to-string.pipe';

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
  styleUrls: ['./artist-detail.component.scss']
})
export class ArtistDetailComponent {
  private readonly addArtistToPlaylistUseCase = inject(AddArtistToPlaylistUseCase);
  private readonly playTrackUseCase = inject(PlayTrackUseCase);
  private readonly addTrackToPlaylistUseCase = inject(AddTrackToPlaylistUseCase);
  private readonly addAlbumToPlaylistUseCase = inject(AddAlbumToPlaylistUseCase);

  // Inputs (signal-based)
  artist = input<Artist | null>(null);
  albums = input<ArtistAlbumGroup[]>([]);

  // Outputs (signal-based)
  closeDetail = output<void>();
  trackSelected = output<Track>();
  albumSelected = output<number>();

  onClose(): void {
    this.closeDetail.emit();
  }

  onPlayTrack(track: Track): void {
    this.playTrackUseCase.execute(track.songId).subscribe({
      next: () => this.trackSelected.emit(track),
      error: error => console.error('Error playing track:', error)
    });
  }

  onAddTrackToPlaylist(track: Track): void {
    this.addTrackToPlaylistUseCase.execute(track.songId).subscribe({
      next: () => console.log('Track added to playlist:', track.title),
      error: error => console.error('Error adding track to playlist:', error)
    });
  }

  onPlayAlbum(albumId: number): void {
    this.addAlbumToPlaylistUseCase.execute(albumId, true).subscribe({
      next: () => this.albumSelected.emit(albumId),
      error: error => console.error('Error playing album:', error)
    });
  }

  onAddAlbumToPlaylist(albumId: number): void {
    this.addAlbumToPlaylistUseCase.execute(albumId, false).subscribe({
      next: () => console.log('Album added to playlist:', albumId),
      error: error => console.error('Error adding album to playlist:', error)
    });
  }

  onPlayArtist(): void {
    const artist = this.artist();
    if (!artist) return;
    this.addArtistToPlaylistUseCase
      .execute(artist.artistId, true)
      .subscribe({
        next: () => console.log('Playing artist:', artist.name),
        error: error => console.error('Error playing artist:', error)
      });
  }

  onAddArtistToPlaylist(): void {
    const artist = this.artist();
    if (!artist) return;
    this.addArtistToPlaylistUseCase
      .execute(artist.artistId, false)
      .subscribe({
        next: () => console.log('Added artist to playlist:', artist.name),
        error: error => console.error('Error adding artist to playlist:', error)
      });
  }
}
