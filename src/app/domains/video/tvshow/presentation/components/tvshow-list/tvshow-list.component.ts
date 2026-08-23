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
import {
  IonContent,
  IonList,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonProgressBar,
  IonModal,
  AlertController,
  InfiniteScrollCustomEvent
} from '@ionic/angular/standalone';
import { EMPTY, Subject, catchError, forkJoin, switchMap } from 'rxjs';

import { LateralPanelComponent } from '@shared/components/lateral-panel/lateral-panel.component';
import { MediaTileComponent } from '@shared/components/media-tile/media-tile.component';
import { TVShow, TVShowSearchParams, Season, Episode } from '../../../domain/entities/tvshow.entity';
import { GetTVShowsUseCase } from '../../../application/use-cases/get-tvshows.use-case';
import { GetTVShowDetailUseCase } from '../../../application/use-cases/get-tvshow-detail.use-case';
import { GetSeasonsUseCase } from '../../../application/use-cases/get-seasons.use-case';
import { GetEpisodesUseCase } from '../../../application/use-cases/get-episodes.use-case';
import { AddEpisodeToPlaylistUseCase } from '../../../application/use-cases/add-episode-to-playlist.use-case';
import { TVShowDetailComponent } from '../tvshow-detail/tvshow-detail.component';
import { GlobalSearchService } from '@shared/services/global-search.service';
import { UpdateTVShowUseCase } from '../../../application/use-cases/update-tvshow.use-case';
import { RefreshTVShowUseCase } from '../../../application/use-cases/refresh-tvshow.use-case';
import { MediaRefreshOptions } from '@shared/types/media-refresh.type';
import { TVShowUpdate } from '../../../domain/entities/tvshow.entity';
import { MediaEditModalComponent } from '@shared/components/media-edit-modal/media-edit-modal.component';
import { NotificationService } from '@shared/services/notification.service';
import { MediaEditPatch, MediaEditValue } from '@shared/types/media-edit-schema.type';
import { MediaArtworkSet } from '@shared/types/media-artwork.type';
import { TVSHOW_EDIT_SCHEMA } from '../../schemas/tvshow-edit.schema';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-tvshow-list',
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
    TVShowDetailComponent,
    IonModal,
    MediaEditModalComponent
  ],
  templateUrl: './tvshow-list.component.html',
  styleUrl: './tvshow-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TVShowListComponent {
  // Use Cases
  private readonly getTVShowsUseCase = inject(GetTVShowsUseCase);
  private readonly getTVShowDetailUseCase = inject(GetTVShowDetailUseCase);
  private readonly updateTVShowUseCase = inject(UpdateTVShowUseCase);
  private readonly refreshTVShowUseCase = inject(RefreshTVShowUseCase);
  private readonly alertController = inject(AlertController);
  private readonly notifications = inject(NotificationService);
  private readonly getSeasonsUseCase = inject(GetSeasonsUseCase);
  private readonly getEpisodesUseCase = inject(GetEpisodesUseCase);
  private readonly addEpisodeToPlaylistUseCase = inject(AddEpisodeToPlaylistUseCase);
  private readonly globalSearch = inject(GlobalSearchService);
  private readonly destroyRef = inject(DestroyRef);

  // State
  readonly tvshows = signal<TVShow[]>([]);
  readonly selectedTVShow = signal<TVShow | null>(null);
  readonly seasons = signal<Season[]>([]);
  readonly episodes = signal<Episode[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isPanelOpen = signal<boolean>(false);
  readonly totalTVShows = signal<number>(9999);

  // Pagination
  private readonly limit = 40;
  private readonly start = signal<number>(0);
  private readonly end = signal<number>(this.limit);
  private currentSearchTerm: string | null = null;

  // Unico punto de entrada de carga: una peticion nueva cancela la que este en vuelo
  private readonly loadRequest$ = new Subject<TVShowSearchParams>();

  // Computed
  readonly hasMoreTVShows = computed(() => this.start() < this.totalTVShows());
  readonly panelTitle = computed(() => this.selectedTVShow()?.title ?? '');

  constructor() {
    this.loadRequest$
      .pipe(
        switchMap(params =>
          this.getTVShowsUseCase.execute(params).pipe(
            catchError(err => {
              console.error('Error loading TV shows:', err);
              this.isLoading.set(false);
              return EMPTY;
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(result => {
        this.totalTVShows.set(result.total);
        this.tvshows.update(current => [...current, ...result.tvshows]);
        this.isLoading.set(false);
      });

    effect(() => {
      const term = this.globalSearch.debouncedSearchTerm();

      // El effect solo debe depender del termino: resetPagination y loadTVShows
      // escriben y leen los signals de paginacion, que si no quedarian
      // registrados como dependencias del propio effect.
      untracked(() => {
        if (this.currentSearchTerm !== term) {
          this.currentSearchTerm = term;
          this.resetPagination();
          this.loadTVShows();
        }
      });
    });
  }

  private resetPagination(): void {
    this.start.set(0);
    this.end.set(this.limit);
    this.tvshows.set([]);
  }

  loadTVShows(): void {
    this.isLoading.set(true);

    this.loadRequest$.next({
      start: this.start(),
      end: this.end(),
      searchTerm: this.currentSearchTerm || undefined
    });
  }

  onInfiniteScroll(event: InfiniteScrollCustomEvent): void {
    if (!this.hasMoreTVShows()) {
      event.target.disabled = true;
      return;
    }

    this.start.set(this.end());
    this.end.update(current => current + this.limit);
    this.loadTVShows();

    setTimeout(() => event.target.complete(), 500);
  }

  onTVShowSelected(tvshow: unknown): void {
    const selected = tvshow as TVShow;
    this.isLoading.set(true);

    forkJoin({
      detail: this.getTVShowDetailUseCase.execute(selected.tvshowId),
      seasons: this.getSeasonsUseCase.execute(selected.tvshowId)
    }).subscribe({
      next: ({ detail, seasons }) => {
        this.selectedTVShow.set(detail);
        this.seasons.set(seasons);
        this.isPanelOpen.set(true);

        // Load first season episodes
        if (seasons.length > 0) {
          this.loadEpisodes(selected.tvshowId, seasons[0].season);
        } else {
          this.episodes.set([]);
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.error('Error loading TV show detail:', err);
        this.isLoading.set(false);
      }
    });
  }

  onSeasonSelected(seasonNumber: number): void {
    const tvshow = this.selectedTVShow();
    if (!tvshow) return;

    this.isLoading.set(true);
    this.loadEpisodes(tvshow.tvshowId, seasonNumber);
  }

  onPlayEpisode(episodeId: number): void {
    this.addEpisodeToPlaylistUseCase.execute(episodeId, true).subscribe({
      error: (err) => console.error('Error playing episode:', err)
    });
  }

  onAddEpisodeToQueue(episodeId: number): void {
    this.addEpisodeToPlaylistUseCase.execute(episodeId, false).subscribe({
      error: (err) => console.error('Error adding episode to queue:', err)
    });
  }

  // Edicion. El panel lateral se saca a si mismo a document.body, fuera de
  // ion-app, asi que se aparta mientras se edita en vez de competir con el modal.
  readonly editSchema = TVSHOW_EDIT_SCHEMA;
  readonly tvshowBeingEdited = signal<TVShow | null>(null);
  readonly isSaving = signal<boolean>(false);

  /** Referencia estable: con un metodo el modal repondria el borrador en cada ciclo. */
  readonly editValue = computed<Record<string, MediaEditValue>>(() => {
    const tvshow = this.tvshowBeingEdited();

    if (!tvshow) {
      return {};
    }

    return {
      title: tvshow.title,
      originalTitle: tvshow.originalTitle,
      sortTitle: tvshow.sortTitle,
      plot: tvshow.plot,
      status: tvshow.status,
      genre: tvshow.genre,
      studio: tvshow.studio,
      tag: tvshow.tag,
      premiered: tvshow.premiered,
      runtime: tvshow.runtime,
      rating: tvshow.rating,
      userRating: tvshow.userRating,
      votes: tvshow.votes,
      mpaa: tvshow.mpaa,
      imdbNumber: tvshow.imdbNumber,
      episodeGuide: tvshow.episodeGuide
    };
  });

  readonly editArtwork = computed<MediaArtworkSet | null>(
    () => this.tvshowBeingEdited()?.art ?? null
  );

  /**
   * Pregunta con que titulo buscar antes de lanzar el re-scrapeo, y si el
   * refresco debe arrastrar a los episodios.
   */
  async onRefreshRequested(tvshow: TVShow): Promise<void> {
    // El panel se aparta igual que al editar: se saca a si mismo a
    // document.body en su ngOnInit, fuera de ion-app.
    this.isPanelOpen.set(false);

    const alert = await this.alertController.create({
      header: 'Volver a buscar los datos',
      message:
        'Kodi buscara de nuevo en el scraper y reescribira los campos de esta ' +
        'serie, incluidas las correcciones hechas a mano.',
      inputs: [
        {
          name: 'title',
          type: 'text',
          value: tvshow.title,
          placeholder: 'Título con el que buscar'
        },
        {
          name: 'ignoreNfo',
          type: 'checkbox',
          label: 'Ignorar el archivo NFO local',
          value: 'ignoreNfo'
        },
        {
          name: 'refreshEpisodes',
          type: 'checkbox',
          label: 'Refrescar también todos los episodios',
          value: 'refreshEpisodes'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Buscar',
          handler: (data: {
            title?: string;
            ignoreNfo?: string[];
            refreshEpisodes?: string[];
          }) => {
            const checked = [
              ...(data.ignoreNfo ?? []),
              ...(data.refreshEpisodes ?? [])
            ];

            this.refreshTVShow(tvshow, {
              title: data.title,
              ignoreNfo: checked.includes('ignoreNfo'),
              refreshEpisodes: checked.includes('refreshEpisodes')
            });
          }
        }
      ]
    });

    await alert.present();
    await alert.onDidDismiss();

    this.restoreDetail(tvshow);
  }

  onReloadRequested(tvshow: TVShow): void {
    this.refreshSelectedTVShow(tvshow.tvshowId);
    void this.notifications.info('Datos recargados desde Kodi');
  }

  private refreshTVShow(tvshow: TVShow, options: MediaRefreshOptions): void {
    this.refreshTVShowUseCase.execute(tvshow.tvshowId, options).subscribe({
      next: () => {
        // El metodo vuelve enseguida: el scrapeo lo hace Kodi por detras.
        void this.notifications.info(
          'Kodi está buscando los datos. Usa «recargar» cuando termine.'
        );
      },
      error: (error: Error) => void this.notifications.error(error.message)
    });
  }

  onEditRequested(tvshow: TVShow): void {
    this.tvshowBeingEdited.set(tvshow);
    this.isPanelOpen.set(false);
  }

  onEditCancelled(): void {
    const tvshow = this.tvshowBeingEdited();

    if (!tvshow) {
      return;
    }

    this.tvshowBeingEdited.set(null);
    this.restoreDetail(tvshow);
  }

  onEditSave(patch: MediaEditPatch): void {
    const tvshow = this.tvshowBeingEdited();

    if (!tvshow) {
      return;
    }

    this.isSaving.set(true);

    this.updateTVShowUseCase.execute(tvshow.tvshowId, patch as TVShowUpdate).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.tvshowBeingEdited.set(null);
        void this.notifications.success('Serie actualizada');
        this.restoreDetail(tvshow);
        this.refreshSelectedTVShow(tvshow.tvshowId);
      },
      error: (error: Error) => {
        this.isSaving.set(false);
        void this.notifications.error(error.message);
      }
    });
  }

  /** Cerrar el panel emite panelClosed, que limpia la serie seleccionada. */
  private restoreDetail(tvshow: TVShow): void {
    this.selectedTVShow.set(tvshow);
    this.isPanelOpen.set(true);
  }

  /** Tras guardar, el detalle debe mostrar lo que Kodi tiene ahora. */
  private refreshSelectedTVShow(tvshowId: number): void {
    this.getTVShowDetailUseCase.execute(tvshowId).subscribe({
      next: detail => this.selectedTVShow.set(detail)
    });
  }

  onPanelClosed(): void {
    this.isPanelOpen.set(false);
    this.selectedTVShow.set(null);
    this.seasons.set([]);
    this.episodes.set([]);
  }

  private loadEpisodes(tvshowId: number, season: number): void {
    this.getEpisodesUseCase.execute(tvshowId, season).subscribe({
      next: (episodes) => {
        this.episodes.set(episodes);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading episodes:', err);
        this.isLoading.set(false);
      }
    });
  }
}
