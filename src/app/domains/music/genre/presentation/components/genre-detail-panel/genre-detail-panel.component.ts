// ==========================================================================
// PRESENTATION - Genre Detail Panel Component
// ==========================================================================

import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
  signal
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  IonContent,
  IonImg,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonListHeader,
  IonProgressBar
} from '@ionic/angular/standalone';

import { Genre } from '../../../domain/entities/genre.entity';
import { Album } from '@domains/music/album/domain/entities/album.entity';
import { Artist } from '@domains/music/artist/domain/entities/artist.entity';
import { Track } from '@domains/music/track/domain/entities/track.entity';
import { AddAlbumToPlaylistUseCase, GetAlbumDetailUseCase } from '@domains/music/album';
import { AssetsPipe } from '@shared/pipes/assets.pipe';
import { LateralSlideComponent } from '@shared/components/lateral-slide/lateral-slide.component';
import { AlbumDetailComponent } from '@domains/music/album/presentation/components/album-detail/album-detail.component';
import { NotificationService } from '@shared/services/notification.service';

@Component({
  selector: 'app-genre-detail-panel',
  standalone: true,
  imports: [
    IonContent,
    IonImg,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonListHeader,
    IonProgressBar,
    AssetsPipe,
    LateralSlideComponent,
    AlbumDetailComponent
  ],
  templateUrl: './genre-detail-panel.component.html',
  styleUrl: './genre-detail-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenreDetailPanelComponent {
  private readonly notifications = inject(NotificationService);
  private readonly addAlbumToPlaylistUseCase = inject(AddAlbumToPlaylistUseCase);
  private readonly getAlbumDetailUseCase = inject(GetAlbumDetailUseCase);

  // Inputs
  readonly genre = input.required<Genre>();
  readonly albums = input.required<Album[]>();
  readonly artists = input.required<Artist[]>();

  // State for nested panel
  readonly isAlbumPanelOpen = signal<boolean>(false);
  readonly selectedAlbum = signal<Album | null>(null);
  readonly albumTracks = signal<Track[]>([]);
  readonly isLoading = signal<boolean>(false);

  onPlayAlbum(albumId: number): void {
    this.addAlbumToPlaylistUseCase.execute(albumId, true).subscribe({
      error: () => void this.notifications.error('No se ha podido reproducir el álbum')
    });
  }

  onAddAlbumToQueue(albumId: number): void {
    this.addAlbumToPlaylistUseCase.execute(albumId, false).subscribe({
      error: () => void this.notifications.error('No se ha podido añadir el álbum a la cola')
    });
  }

  onAlbumClick(album: Album): void {
    this.isLoading.set(true);

    this.getAlbumDetailUseCase.execute(album.albumId).subscribe({
      next: (result) => {
        this.selectedAlbum.set(result.album);
        this.albumTracks.set(result.tracks);
        this.isAlbumPanelOpen.set(true);
        this.isLoading.set(false);
      },
      error: (err) => {
        void this.notifications.error('No se ha podido cargar el álbum');
        this.isLoading.set(false);
      }
    });
  }

  onCloseAlbumPanel(): void {
    this.isAlbumPanelOpen.set(false);
    this.selectedAlbum.set(null);
    this.albumTracks.set([]);
  }
}
