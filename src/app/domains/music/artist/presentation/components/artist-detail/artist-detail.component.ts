// ==========================================================================
// PRESENTATION - Artist Detail Component
// ==========================================================================

import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { IonicModule } from '@ionic/angular';

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
    NgFor,
    NgIf,
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

  @Input() artist: Artist | null = null;
  @Input() albums: ArtistAlbumGroup[] = [];

  @Output() closeDetail = new EventEmitter<void>();
  @Output() trackSelected = new EventEmitter<Track>();
  @Output() albumSelected = new EventEmitter<number>();

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
    if (!this.artist) return;
    this.addArtistToPlaylistUseCase
      .execute(this.artist.artistId, true)
      .subscribe({
        next: () => console.log('Playing artist:', this.artist?.name),
        error: error => console.error('Error playing artist:', error)
      });
  }

  onAddArtistToPlaylist(): void {
    if (!this.artist) return;
    this.addArtistToPlaylistUseCase
      .execute(this.artist.artistId, false)
      .subscribe({
        next: () => console.log('Added artist to playlist:', this.artist?.name),
        error: error => console.error('Error adding artist to playlist:', error)
      });
  }
}
