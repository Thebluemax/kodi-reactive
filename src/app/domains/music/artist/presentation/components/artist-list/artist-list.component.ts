// ==========================================================================
// PRESENTATION - Artist List Component
// ==========================================================================

import { Component, OnDestroy, inject, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule, InfiniteScrollCustomEvent } from '@ionic/angular';
import { EMPTY, Subject, catchError, switchMap, takeUntil } from 'rxjs';

import { Artist, ArtistAlbumGroup, ArtistSearchParams } from '../../../domain/entities/artist.entity';
import { GetArtistsUseCase } from '../../../application/use-cases/get-artists.use-case';
import { GetArtistDetailUseCase } from '../../../application/use-cases/get-artist-detail.use-case';

import { LateralPanelComponent } from '@shared/components/lateral-panel/lateral-panel.component';
import { AssetsPipe } from '@shared/pipes/assets.pipe';
import { ArtistDetailComponent } from '../artist-detail/artist-detail.component';
import { UpdateArtistUseCase } from '../../../application/use-cases/update-artist.use-case';
import { ArtistUpdate } from '../../../domain/entities/artist.entity';
import { MediaEditModalComponent } from '@shared/components/media-edit-modal/media-edit-modal.component';
import { NotificationService } from '@shared/services/notification.service';
import { MediaEditPatch, MediaEditValue } from '@shared/types/media-edit-schema.type';
import { MediaArtworkSet } from '@shared/types/media-artwork.type';
import { ARTIST_EDIT_SCHEMA } from '../../schemas/artist-edit.schema';
import { GlobalSearchService } from '@shared/services/global-search.service';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

const PAGE_SIZE = 40;

@Component({
  selector: 'app-artist-list',
  standalone: true,
  imports: [
    EmptyStateComponent,
    IonicModule,

    LateralPanelComponent,
    ArtistDetailComponent,
    MediaEditModalComponent,
    AssetsPipe
  ],
  templateUrl: './artist-list.component.html',
  styleUrls: ['./artist-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtistListComponent implements OnDestroy {
  private readonly getArtistsUseCase = inject(GetArtistsUseCase);
  private readonly getArtistDetailUseCase = inject(GetArtistDetailUseCase);
  private readonly updateArtistUseCase = inject(UpdateArtistUseCase);
  private readonly notifications = inject(NotificationService);
  private readonly globalSearch = inject(GlobalSearchService);
  private readonly destroy$ = new Subject<void>();

  // Signals for reactive state
  readonly artists = signal<Artist[]>([]);
  readonly selectedArtist = signal<Artist | null>(null);
  readonly albums = signal<ArtistAlbumGroup[]>([]);
  readonly isLoading = signal<boolean>(false);
  /**
   * Motivo del ultimo fallo de carga. Sin esto una lista vacia por un fallo de
   * red se anunciaba como biblioteca vacia.
   */
  readonly loadError = signal<string>('');
  readonly isPanelOpen = signal<boolean>(false);

  // Edicion. El cajon lateral se saca a si mismo a document.body, fuera de
  // ion-app, asi que se aparta mientras se edita en vez de competir con el modal.
  readonly editSchema = ARTIST_EDIT_SCHEMA;
  readonly artistBeingEdited = signal<Artist | null>(null);
  readonly isSaving = signal<boolean>(false);

  /** Referencia estable: con un metodo el modal repondria el borrador en cada ciclo. */
  readonly editValue = computed<Record<string, MediaEditValue>>(() => {
    const artist = this.artistBeingEdited();

    if (!artist) {
      return {};
    }

    return {
      name: artist.name,
      sortName: artist.sortName,
      type: artist.type,
      gender: artist.gender,
      disambiguation: artist.disambiguation,
      description: artist.description ?? '',
      genres: artist.genres,
      styles: artist.styles,
      moods: artist.moods,
      instruments: artist.instruments,
      born: artist.born ?? '',
      formed: artist.formed ?? '',
      died: artist.died ?? '',
      disbanded: artist.disbanded ?? '',
      yearsActive: artist.yearsActive,
      // Se lee como lista y se escribe como cadena: se muestra el primero.
      musicBrainzId: artist.musicBrainzId?.[0] ?? ''
    };
  });

  readonly editArtwork = computed<MediaArtworkSet | null>(
    () => this.artistBeingEdited()?.art ?? null
  );

  onEditRequested(artist: Artist): void {
    this.artistBeingEdited.set(artist);
    this.isPanelOpen.set(false);
  }

  onEditCancelled(): void {
    const artist = this.artistBeingEdited();

    if (!artist) {
      return;
    }

    this.artistBeingEdited.set(null);
    this.restoreDetail(artist);
  }

  onEditSave(patch: MediaEditPatch): void {
    const artist = this.artistBeingEdited();

    if (!artist) {
      return;
    }

    this.isSaving.set(true);

    this.updateArtistUseCase.execute(artist.artistId, patch as ArtistUpdate).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.artistBeingEdited.set(null);
        void this.notifications.success('Artista actualizado');
        this.restoreDetail(artist);
        this.refreshSelectedArtist(artist.artistId);
      },
      error: (error: Error) => {
        this.isSaving.set(false);
        void this.notifications.error(error.message);
      }
    });
  }

  /** Cerrar el cajon emite closeSlideBar, que limpia el artista seleccionado. */
  private restoreDetail(artist: Artist): void {
    this.selectedArtist.set(artist);
    this.isPanelOpen.set(true);
  }

  /** Tras guardar, el detalle debe mostrar lo que Kodi tiene ahora. */
  private refreshSelectedArtist(artistId: number): void {
    this.getArtistDetailUseCase
      .execute(artistId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          this.selectedArtist.set(result.artist);
          this.albums.set(result.albums);
        }
      });
  }
  readonly totalArtists = signal<number>(0);

  private currentSearchTerm: string | null = null;

  // Unico punto de entrada de carga: una peticion nueva cancela la que este en vuelo
  private readonly loadRequest$ = new Subject<ArtistSearchParams>();
  private pendingScroll: InfiniteScrollCustomEvent | null = null;

  // Computed values
  readonly hasMoreArtists = computed(() =>
    this.artists().length < this.totalArtists()
  );

  private start = 0;
  private end = PAGE_SIZE;

  constructor() {
    this.loadRequest$
      .pipe(
        switchMap(params =>
          this.getArtistsUseCase.execute(params).pipe(
            catchError((error: Error) => {
              this.loadError.set(
                error.message || 'No se ha podido contactar con Kodi'
              );
              this.isLoading.set(false);
              this.completePendingScroll();
              return EMPTY;
            })
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(result => {
        this.artists.update(current => [...current, ...result.artists]);
        this.totalArtists.set(result.total);
        this.isLoading.set(false);
        this.completePendingScroll();
      });

    effect(() => {
      const term = this.globalSearch.debouncedSearchTerm();
      if (this.currentSearchTerm !== term) {
        this.currentSearchTerm = term;
        this.resetPagination();
        this.loadArtists();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetPagination(): void {
    this.completePendingScroll();
    this.start = 0;
    this.end = PAGE_SIZE;
    this.artists.set([]);
  }

  /** Libera el infinite scroll que quedo esperando una peticion ya cancelada */
  private completePendingScroll(): void {
    this.pendingScroll?.target.complete();
    this.pendingScroll = null;
  }

  loadArtists(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    this.loadRequest$.next({
      start: this.start,
      end: this.end,
      searchTerm: this.currentSearchTerm || undefined
    });
  }

  onInfiniteScroll(event: InfiniteScrollCustomEvent): void {
    if (!this.hasMoreArtists()) {
      event.target.complete();
      return;
    }

    this.start = this.end;
    this.end = this.start + PAGE_SIZE;

    this.pendingScroll = event;
    this.loadArtists();
  }

  onArtistClick(artist: Artist): void {
    this.isLoading.set(true);

    this.getArtistDetailUseCase
      .execute(artist.artistId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          this.selectedArtist.set(result.artist);
          this.albums.set(result.albums);
          this.isLoading.set(false);
          this.isPanelOpen.set(true);
        },
        error: error => {
          void this.notifications.error('No se ha podido cargar el artista');
          this.isLoading.set(false);
        }
      });
  }

  onClosePanel(): void {
    this.selectedArtist.set(null);
    this.albums.set([]);
    this.isPanelOpen.set(false);
  }

  /** Vuelve a intentar la carga que fallo. */
  onRetry(): void {
    this.loadArtists();
  }
}
