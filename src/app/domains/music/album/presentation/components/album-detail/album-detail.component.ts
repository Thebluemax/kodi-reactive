import {
  Component,
  ChangeDetectionStrategy,
  computed,
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
import { MediaPathComponent } from '@shared/components/media-path/media-path.component';
import { commonFolder, fileName, isSpreadAcrossFolders } from '@shared/utils/media-path';
import { NotificationService } from '@shared/services/notification.service';

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
    MediaPathComponent,
    AssetsPipe,
    ArrayToStringPipe,
    SecondsToStringPipe
  ],
  templateUrl: './album-detail.component.html',
  styleUrl: './album-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumDetailComponent {
  private readonly notifications = inject(NotificationService);
  private readonly addAlbumToPlaylistUseCase = inject(AddAlbumToPlaylistUseCase);
  private readonly addTrackToPlaylistUseCase = inject(AddTrackToPlaylistUseCase);
  private readonly playTrackUseCase = inject(PlayTrackUseCase);

  // Inputs
  readonly album = input.required<Album>();
  readonly tracks = input<Track[]>([]);

  // Outputs
  /**
   * La API no expone `file` para album: Audio.Fields.Album no lo declara. La
   * carpeta solo puede deducirse de la de sus pistas, y solo vale si todas
   * comparten una.
   */
  readonly albumFolder = computed(() =>
    commonFolder(this.tracks().map(track => track.file))
  );

  readonly tracksAreSpread = computed(() =>
    isSpreadAcrossFolders(this.tracks().map(track => track.file))
  );

  trackFileName(track: Track): string {
    return fileName(track.file);
  }
  /**
   * El modal no se monta aqui: este componente se proyecta dentro del panel
   * lateral, y un ion-modal inline se queda donde se declara, heredando su
   * contexto de apilamiento y su overflow. Lo abre el contenedor, que si esta
   * fuera del panel.
   */
  readonly editRequested = output<Album>();

  onEdit(): void {
    this.editRequested.emit(this.album());
  }

  onPlayTrack(track: Track): void {
    this.playTrackUseCase.execute(track.songId).subscribe({
      error: () => void this.notifications.error('No se ha podido reproducir la pista')
    });
  }

  onAddTrack(track: Track): void {
    this.addTrackToPlaylistUseCase.execute(track.songId, false).subscribe({
      error: () => void this.notifications.error('No se ha podido añadir la pista a la cola')
    });
  }

  onAddAlbumToPlaylist(): void {
    const albumId = this.album().albumId;
    this.addAlbumToPlaylistUseCase.execute(albumId, false).subscribe({
      error: () => void this.notifications.error('No se ha podido añadir el álbum a la cola')
    });
  }
}
