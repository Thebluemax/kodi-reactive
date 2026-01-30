import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject
} from '@angular/core';
import {
  IonContent,
  IonImg,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonButtons,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';

import { Album } from '../../../domain/entities/album.entity';
import { Track } from '@domains/music/track/domain/entities/track.entity';
import { AssetsPipe } from '@shared/pipes/assets.pipe';
import { ArrayToStringPipe } from '@shared/pipes/array-to-string.pipe';
import { SecondsToStringPipe } from '@shared/pipes/seconds-to-string.pipe';
import { AddAlbumToPlaylistUseCase } from '../../../application/use-cases/add-album-to-playlist.use-case';
import { AddTrackToPlaylistUseCase, PlayTrackUseCase } from '@domains/music/track';

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [
    IonContent,
    IonImg,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonButtons,
    IonButton,
    IonIcon,
    AssetsPipe,
    ArrayToStringPipe,
    SecondsToStringPipe
  ],
  templateUrl: './album-detail.component.html',
  styleUrl: './album-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumDetailComponent {
  private readonly addAlbumToPlaylistUseCase = inject(AddAlbumToPlaylistUseCase);
  private readonly addTrackToPlaylistUseCase = inject(AddTrackToPlaylistUseCase);
  private readonly playTrackUseCase = inject(PlayTrackUseCase);

  // Inputs
  readonly album = input.required<Album>();
  readonly tracks = input<Track[]>([]);

  // Outputs
  readonly trackSelected = output<Track>();

  onPlayTrack(track: Track): void {
    this.playTrackUseCase.execute(track.songId).subscribe({
      next: () => {
        console.log('Track started playing:', track.title);
      },
      error: (error) => {
        console.error('Error playing track:', error);
      }
    });
  }

  onAddTrack(track: Track): void {
    this.addTrackToPlaylistUseCase.execute(track.songId, false).subscribe({
      next: () => {
        console.log('Track added to playlist successfully:', track.title);
      },
      error: (error) => {
        console.error('Error adding track to playlist:', error);
      }
    });
  }

  onAddAlbumToPlaylist(): void {
    const albumId = this.album().albumId;
    this.addAlbumToPlaylistUseCase.execute(albumId, false).subscribe({
      next: () => {
        console.log('Album added to playlist successfully');
      },
      error: (error) => {
        console.error('Error adding album to playlist:', error);
      }
    });
  }
}
