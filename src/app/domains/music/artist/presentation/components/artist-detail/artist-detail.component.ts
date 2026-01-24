// ==========================================================================
// PRESENTATION - Artist Detail Component
// ==========================================================================

import { Component, inject, input, output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { play, add } from 'ionicons/icons';

import { Artist, ArtistAlbumGroup } from '../../../domain/entities/artist.entity';
import { Track } from '@domains/music/track/domain/entities/track.entity';
import { AddArtistToPlaylistUseCase } from '../../../application/use-cases/add-artist-to-playlist.use-case';
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

  constructor() {
    addIcons({ play, add });
  }

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
    this.trackSelected.emit(track);
  }

  onAddTrackToPlaylist(track: Track): void {
    // TODO: Implement add track to playlist via Track use case
    console.log('Add track to playlist:', track);
  }

  onPlayAlbum(albumId: number): void {
    this.albumSelected.emit(albumId);
  }

  onAddAlbumToPlaylist(albumId: number): void {
    // TODO: Implement add album to playlist via Album use case
    console.log('Add album to playlist:', albumId);
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
