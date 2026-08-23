import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
  untracked,
  DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, switchMap } from 'rxjs';
import {
  IonContent,
  IonList,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonProgressBar,
  IonModal,
  InfiniteScrollCustomEvent
} from '@ionic/angular/standalone';

import { LateralPanelComponent } from '@shared/components/lateral-panel/lateral-panel.component';
import { MediaTileComponent } from '@shared/components/media-tile/media-tile.component';
import { Album, AlbumSearchParams } from '../../../domain/entities/album.entity';
import { Track } from '@domains/music/track/domain/entities/track.entity';
import { GetAlbumsUseCase } from '../../../application/use-cases/get-albums.use-case';
import { GetAlbumDetailUseCase } from '../../../application/use-cases/get-album-detail.use-case';
import { AddAlbumToPlaylistUseCase } from '../../../application/use-cases/add-album-to-playlist.use-case';
import { AlbumDetailComponent } from '../album-detail/album-detail.component';
import { UpdateAlbumUseCase } from '../../../application/use-cases/update-album.use-case';
import { MediaEditModalComponent } from '@shared/components/media-edit-modal/media-edit-modal.component';
import { NotificationService } from '@shared/services/notification.service';
import { MediaEditPatch, MediaEditValue } from '@shared/types/media-edit-schema.type';
import { ALBUM_EDIT_SCHEMA } from '../../schemas/album-edit.schema';
import { AlbumUpdate } from '../../../domain/entities/album.entity';
import { GlobalSearchService } from '@shared/services/global-search.service';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-album-list',
  standalone: true,
  imports: [
    EmptyStateComponent,
    IonContent,
    IonList,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonProgressBar,
    MediaTileComponent,
    LateralPanelComponent,
    AlbumDetailComponent,
    IonModal,
    MediaEditModalComponent
  ],
  templateUrl: './album-list.component.html',
  styleUrl: './album-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumListComponent {
  // Use Cases
  private readonly getAlbumsUseCase = inject(GetAlbumsUseCase);
  private readonly getAlbumDetailUseCase = inject(GetAlbumDetailUseCase);
  private readonly addToPlaylistUseCase = inject(AddAlbumToPlaylistUseCase);
  private readonly updateAlbumUseCase = inject(UpdateAlbumUseCase);
  private readonly notifications = inject(NotificationService);
  private readonly globalSearch = inject(GlobalSearchService);
  private readonly destroyRef = inject(DestroyRef);

  // State
  readonly albums = signal<Album[]>([]);
  readonly selectedAlbum = signal<Album | null>(null);
  readonly tracks = signal<Track[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isPanelOpen = signal<boolean>(false);

  // Edicion. El modal vive aqui, no en el detalle: el detalle se proyecta
  // dentro del panel lateral, y un ion-modal inline se queda donde se declara.
  readonly editSchema = ALBUM_EDIT_SCHEMA;
  readonly albumBeingEdited = signal<Album | null>(null);
  readonly isSaving = signal<boolean>(false);
  readonly totalAlbums = signal<number>(9999);

  // Pagination
  private readonly limit = 40;
  private readonly start = signal<number>(0);
  private readonly end = signal<number>(this.limit);
  private currentSearchTerm: string | null = null;

  // Unico punto de entrada de carga: una peticion nueva cancela la que este en vuelo
  private readonly loadRequest$ = new Subject<AlbumSearchParams>();

  // Computed
  readonly hasMoreAlbums = computed(() => this.start() < this.totalAlbums());

  constructor() {
    this.loadRequest$
      .pipe(
        switchMap(params =>
          this.getAlbumsUseCase.execute(params).pipe(
            catchError(err => {
              console.error('Error loading albums:', err);
              this.isLoading.set(false);
              return EMPTY;
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(result => {
        this.totalAlbums.set(result.total);
        this.albums.update(current => [...current, ...result.albums]);
        this.isLoading.set(false);
      });

    effect(() => {
      const term = this.globalSearch.debouncedSearchTerm();

      // El effect solo debe depender del termino: resetPagination y loadAlbums
      // escriben y leen los signals de paginacion, que si no quedarian
      // registrados como dependencias del propio effect.
      untracked(() => {
        if (this.currentSearchTerm !== term) {
          this.currentSearchTerm = term;
          this.resetPagination();
          this.loadAlbums();
        }
      });
    });
  }

  private resetPagination(): void {
    this.start.set(0);
    this.end.set(this.limit);
    this.albums.set([]);
  }

  loadAlbums(): void {
    this.isLoading.set(true);

    this.loadRequest$.next({
      start: this.start(),
      end: this.end(),
      searchTerm: this.currentSearchTerm || undefined
    });
  }

  onInfiniteScroll(event: InfiniteScrollCustomEvent): void {
    if (!this.hasMoreAlbums()) {
      event.target.disabled = true;
      return;
    }

    this.start.set(this.end());
    this.end.update(current => current + this.limit);
    this.loadAlbums();

    setTimeout(() => event.target.complete(), 500);
  }

  onAlbumSelected(album: unknown): void {
    const selectedAlbum = album as Album;
    this.isLoading.set(true);

    this.getAlbumDetailUseCase.execute(selectedAlbum.albumId).subscribe({
      next: (result) => {
        this.selectedAlbum.set(result.album);
        this.tracks.set(result.tracks);
        this.isPanelOpen.set(true);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading album detail:', err);
        this.isLoading.set(false);
      }
    });
  }

  onAddToPlaylist(event: { media: unknown; playMedia: boolean }): void {
    const album = event.media as Album;
    this.addToPlaylistUseCase.execute(album.albumId, event.playMedia).subscribe({
      next: () => console.log('Album added to playlist'),
      error: (err) => console.error('Error adding to playlist:', err)
    });
  }

  /** El modal solo conoce claves y valores; el mapeo a la API es del repositorio. */
  editValue(): Record<string, MediaEditValue> {
    const album = this.albumBeingEdited();

    if (!album) {
      return {};
    }

    return {
      title: album.title,
      artists: album.artists,
      genres: album.genres,
      styles: album.styles,
      label: album.label,
      year: album.year,
      description: album.description ?? ''
    };
  }

  onEditRequested(album: Album): void {
    this.albumBeingEdited.set(album);
  }

  onEditCancelled(): void {
    this.albumBeingEdited.set(null);
  }

  onEditSave(patch: MediaEditPatch): void {
    const album = this.albumBeingEdited();

    if (!album) {
      return;
    }

    this.isSaving.set(true);

    this.updateAlbumUseCase.execute(album.albumId, patch as AlbumUpdate).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.albumBeingEdited.set(null);
        void this.notifications.success('Álbum actualizado');
        this.refreshSelectedAlbum(album.albumId);
      },
      error: (error: Error) => {
        this.isSaving.set(false);
        void this.notifications.error(error.message);
      }
    });
  }

  /** Tras guardar, el panel debe mostrar lo que Kodi tiene ahora, no lo enviado. */
  private refreshSelectedAlbum(albumId: number): void {
    this.getAlbumDetailUseCase.execute(albumId).subscribe({
      next: result => this.selectedAlbum.set(result.album)
    });
  }

  onPanelClosed(): void {
    this.isPanelOpen.set(false);
    this.selectedAlbum.set(null);
  }

  onTrackAddToPlaylist(track: Track): void {
    // TODO: Implement track add to playlist use case
    console.log('Add track to playlist:', track);
  }
}
