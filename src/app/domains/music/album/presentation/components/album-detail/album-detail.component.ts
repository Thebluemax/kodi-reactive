import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
  signal
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
  IonIcon,
  IonModal
} from '@ionic/angular/standalone';

import { Album, AlbumUpdate } from '../../../domain/entities/album.entity';
import { Track } from '@domains/music/track/domain/entities/track.entity';
import { AssetsPipe } from '@shared/pipes/assets.pipe';
import { ArrayToStringPipe } from '@shared/pipes/array-to-string.pipe';
import { SecondsToStringPipe } from '@shared/pipes/seconds-to-string.pipe';
import { AddAlbumToPlaylistUseCase } from '../../../application/use-cases/add-album-to-playlist.use-case';
import { AddTrackToPlaylistUseCase, PlayTrackUseCase } from '@domains/music/track';
import { UpdateAlbumUseCase } from '../../../application/use-cases/update-album.use-case';
import { MediaEditModalComponent } from '@shared/components/media-edit-modal/media-edit-modal.component';
import { NotificationService } from '@shared/services/notification.service';
import { MediaEditPatch, MediaEditValue } from '@shared/types/media-edit-schema.type';
import { ALBUM_EDIT_SCHEMA } from '../../schemas/album-edit.schema';

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
    IonModal,
    MediaEditModalComponent,
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
  private readonly updateAlbumUseCase = inject(UpdateAlbumUseCase);
  private readonly notifications = inject(NotificationService);

  // Inputs
  readonly album = input.required<Album>();
  readonly tracks = input<Track[]>([]);

  // Outputs
  readonly trackSelected = output<Track>();
  /** El detalle no recarga solo: avisa para que el contenedor refresque. */
  readonly albumUpdated = output<void>();

  // Edicion
  readonly editSchema = ALBUM_EDIT_SCHEMA;
  readonly isEditOpen = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);

  /** El modal solo conoce claves y valores; el mapeo a la API es del repositorio. */
  readonly editValue = (): Record<string, MediaEditValue> => {
    const album = this.album();

    return {
      title: album.title,
      artists: album.artists,
      genres: album.genres,
      styles: album.styles,
      label: album.label,
      year: album.year,
      description: album.description ?? ''
    };
  };

  onEdit(): void {
    this.isEditOpen.set(true);
  }

  onEditCancelled(): void {
    this.isEditOpen.set(false);
  }

  onEditSave(patch: MediaEditPatch): void {
    this.isSaving.set(true);

    this.updateAlbumUseCase.execute(this.album().albumId, patch as AlbumUpdate).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isEditOpen.set(false);
        void this.notifications.success('Álbum actualizado');
        this.albumUpdated.emit();
      },
      error: (error: Error) => {
        this.isSaving.set(false);
        void this.notifications.error(error.message);
      }
    });
  }

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
