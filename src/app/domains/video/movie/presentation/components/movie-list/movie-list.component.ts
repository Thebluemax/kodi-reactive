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
  AlertController,
  InfiniteScrollCustomEvent
} from '@ionic/angular/standalone';

import { LateralPanelComponent } from '@shared/components/lateral-panel/lateral-panel.component';
import { MediaTileComponent } from '@shared/components/media-tile/media-tile.component';
import { Movie, MovieSearchParams } from '../../../domain/entities/movie.entity';
import { GetMoviesUseCase } from '../../../application/use-cases/get-movies.use-case';
import { GetMovieDetailUseCase } from '../../../application/use-cases/get-movie-detail.use-case';
import { AddMovieToPlaylistUseCase } from '../../../application/use-cases/add-movie-to-playlist.use-case';
import { MovieDetailComponent } from '../movie-detail/movie-detail.component';
import { Actor } from '@domains/video/actor/domain/entities/actor.entity';
import { GetMoviesByActorUseCase } from '@domains/video/actor/application/use-cases/get-movies-by-actor.use-case';
import { ActorDetailComponent } from '@domains/video/actor/presentation/components/actor-detail/actor-detail.component';
import { GlobalSearchService } from '@shared/services/global-search.service';
import { UpdateMovieUseCase } from '../../../application/use-cases/update-movie.use-case';
import { RefreshMovieUseCase } from '../../../application/use-cases/refresh-movie.use-case';
import { MovieUpdate } from '../../../domain/entities/movie.entity';
import { MediaEditModalComponent } from '@shared/components/media-edit-modal/media-edit-modal.component';
import { NotificationService } from '@shared/services/notification.service';
import { MediaEditPatch, MediaEditValue } from '@shared/types/media-edit-schema.type';
import { MediaArtworkSet } from '@shared/types/media-artwork.type';
import { MediaRefreshOptions } from '@shared/types/media-refresh.type';
import { MOVIE_EDIT_SCHEMA } from '../../schemas/movie-edit.schema';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-movie-list',
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
    MovieDetailComponent,
    ActorDetailComponent,
    IonModal,
    MediaEditModalComponent
  ],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieListComponent {
  // Use Cases
  private readonly getMoviesUseCase = inject(GetMoviesUseCase);
  private readonly getMovieDetailUseCase = inject(GetMovieDetailUseCase);
  private readonly updateMovieUseCase = inject(UpdateMovieUseCase);
  private readonly refreshMovieUseCase = inject(RefreshMovieUseCase);
  private readonly alertController = inject(AlertController);
  private readonly notifications = inject(NotificationService);
  private readonly addToPlaylistUseCase = inject(AddMovieToPlaylistUseCase);
  private readonly getMoviesByActorUseCase = inject(GetMoviesByActorUseCase);
  private readonly globalSearch = inject(GlobalSearchService);
  private readonly destroyRef = inject(DestroyRef);

  // State
  readonly movies = signal<Movie[]>([]);
  readonly selectedMovie = signal<Movie | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isPanelOpen = signal<boolean>(false);
  readonly totalMovies = signal<number>(9999);

  // Cross-navigation: actor panel
  readonly panelType = signal<'movie' | 'actor'>('movie');

  // Edicion. El panel lateral se saca a si mismo a document.body, fuera de
  // ion-app, asi que se aparta mientras se edita en vez de competir con el modal.
  readonly editSchema = MOVIE_EDIT_SCHEMA;
  readonly movieBeingEdited = signal<Movie | null>(null);
  readonly isSaving = signal<boolean>(false);

  /** Referencia estable: con un metodo el modal repondria el borrador en cada ciclo. */
  readonly editValue = computed<Record<string, MediaEditValue>>(() => {
    const movie = this.movieBeingEdited();

    if (!movie) {
      return {};
    }

    return {
      title: movie.title,
      originalTitle: movie.originalTitle,
      sortTitle: movie.sortTitle,
      tagline: movie.tagline,
      plot: movie.plot,
      plotOutline: movie.plotOutline,
      genre: movie.genre,
      director: movie.director,
      writer: movie.writer,
      studio: movie.studio,
      country: movie.country,
      tag: movie.tag,
      set: movie.set,
      showlink: movie.showlink,
      premiered: movie.premiered,
      year: movie.year,
      runtime: movie.runtime,
      rating: movie.rating,
      userRating: movie.userRating,
      votes: movie.votes,
      top250: movie.top250,
      mpaa: movie.mpaa,
      imdbNumber: movie.imdbNumber,
      trailer: movie.trailer
    };
  });

  readonly editArtwork = computed<MediaArtworkSet | null>(
    () => this.movieBeingEdited()?.art ?? null
  );

  /**
   * Pregunta con que titulo buscar antes de lanzar el re-scrapeo. El valor de
   * partida es el titulo actual; si esta mal, es justo lo que hay que corregir.
   */
  async onRefreshRequested(movie: Movie): Promise<void> {
    // El panel se aparta igual que al editar: se saca a si mismo a
    // document.body en su ngOnInit, fuera de ion-app, asi que ninguna capa
    // montada dentro de la aplicacion queda por encima de el.
    this.isPanelOpen.set(false);

    const alert = await this.alertController.create({
      header: 'Volver a buscar los datos',
      message:
        'Kodi buscara de nuevo en el scraper y reescribira los campos de esta ' +
        'pelicula, incluidas las correcciones hechas a mano.',
      inputs: [
        {
          name: 'title',
          type: 'text',
          value: movie.title,
          placeholder: 'Título con el que buscar'
        },
        {
          name: 'ignoreNfo',
          type: 'checkbox',
          label: 'Ignorar el archivo NFO local',
          value: 'ignoreNfo'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Buscar',
          handler: (data: { title?: string; ignoreNfo?: string[] }) => {
            this.refreshMovie(movie, {
              title: data.title,
              ignoreNfo: (data.ignoreNfo ?? []).includes('ignoreNfo')
            });
          }
        }
      ]
    });

    await alert.present();
    await alert.onDidDismiss();

    this.restoreDetail(movie);
  }

  onReloadRequested(movie: Movie): void {
    this.refreshSelectedMovie(movie.movieId);
    void this.notifications.info('Datos recargados desde Kodi');
  }

  private refreshMovie(movie: Movie, options: MediaRefreshOptions): void {
    this.refreshMovieUseCase.execute(movie.movieId, options).subscribe({
      next: () => {
        // El metodo vuelve enseguida: el scrapeo lo hace Kodi por detras, asi
        // que recargar aqui devolveria los datos viejos.
        void this.notifications.info(
          'Kodi está buscando los datos. Usa «recargar» cuando termine.'
        );
      },
      error: (error: Error) => void this.notifications.error(error.message)
    });
  }

  onEditRequested(movie: Movie): void {
    this.movieBeingEdited.set(movie);
    this.isPanelOpen.set(false);
  }

  onEditCancelled(): void {
    const movie = this.movieBeingEdited();

    if (!movie) {
      return;
    }

    this.movieBeingEdited.set(null);
    this.restoreDetail(movie);
  }

  onEditSave(patch: MediaEditPatch): void {
    const movie = this.movieBeingEdited();

    if (!movie) {
      return;
    }

    this.isSaving.set(true);

    this.updateMovieUseCase.execute(movie.movieId, patch as MovieUpdate).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.movieBeingEdited.set(null);
        void this.notifications.success('Película actualizada');
        this.restoreDetail(movie);
        this.refreshSelectedMovie(movie.movieId);
      },
      error: (error: Error) => {
        this.isSaving.set(false);
        void this.notifications.error(error.message);
      }
    });
  }

  /**
   * Cerrar el panel emite panelClosed, que limpia la pelicula y devuelve el
   * panel a su modo por defecto, asi que volver al detalle exige reponer ambos.
   */
  private restoreDetail(movie: Movie): void {
    this.selectedMovie.set(movie);
    this.panelType.set('movie');
    this.isPanelOpen.set(true);
  }

  /** Tras guardar, el detalle debe mostrar lo que Kodi tiene ahora. */
  private refreshSelectedMovie(movieId: number): void {
    this.getMovieDetailUseCase.execute(movieId).subscribe({
      next: detail => this.selectedMovie.set(detail)
    });
  }
  readonly selectedActor = signal<Actor | null>(null);
  readonly actorMovies = signal<Movie[]>([]);

  // Pagination
  private readonly limit = 40;
  private readonly start = signal<number>(0);
  private readonly end = signal<number>(this.limit);
  private currentSearchTerm: string | null = null;

  // Unico punto de entrada de carga: una peticion nueva cancela la que este en vuelo
  private readonly loadRequest$ = new Subject<MovieSearchParams>();

  // Computed
  readonly hasMoreMovies = computed(() => this.start() < this.totalMovies());
  readonly panelTitle = computed(() => {
    if (this.panelType() === 'actor' && this.selectedActor()) {
      return this.selectedActor()!.name;
    }
    return this.selectedMovie()?.title ?? '';
  });

  constructor() {
    this.loadRequest$
      .pipe(
        switchMap(params =>
          this.getMoviesUseCase.execute(params).pipe(
            catchError(err => {
              console.error('Error loading movies:', err);
              this.isLoading.set(false);
              return EMPTY;
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(result => {
        this.totalMovies.set(result.total);
        this.movies.update(current => [...current, ...result.movies]);
        this.isLoading.set(false);
      });

    effect(() => {
      const term = this.globalSearch.debouncedSearchTerm();

      // El effect solo debe depender del termino: resetPagination y loadMovies
      // escriben y leen los signals de paginacion, que si no quedarian
      // registrados como dependencias del propio effect.
      untracked(() => {
        if (this.currentSearchTerm !== term) {
          this.currentSearchTerm = term;
          this.resetPagination();
          this.loadMovies();
        }
      });
    });
  }

  private resetPagination(): void {
    this.start.set(0);
    this.end.set(this.limit);
    this.movies.set([]);
  }

  loadMovies(): void {
    this.isLoading.set(true);

    this.loadRequest$.next({
      start: this.start(),
      end: this.end(),
      searchTerm: this.currentSearchTerm || undefined
    });
  }

  onInfiniteScroll(event: InfiniteScrollCustomEvent): void {
    if (!this.hasMoreMovies()) {
      event.target.disabled = true;
      return;
    }

    this.start.set(this.end());
    this.end.update(current => current + this.limit);
    this.loadMovies();

    setTimeout(() => event.target.complete(), 500);
  }

  onMovieSelected(movie: unknown): void {
    const selected = movie as Movie;
    this.isLoading.set(true);
    this.panelType.set('movie');

    this.getMovieDetailUseCase.execute(selected.movieId).subscribe({
      next: (detail) => {
        this.selectedMovie.set(detail);
        this.isPanelOpen.set(true);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading movie detail:', err);
        this.isLoading.set(false);
      }
    });
  }

  // Cross-navigation: actor clicked from movie detail cast list
  onActorSelectedFromMovie(actorName: string): void {
    this.isLoading.set(true);

    this.getMoviesByActorUseCase.execute(actorName).subscribe({
      next: (movies) => {
        const actor: Actor = {
          name: actorName,
          thumbnail: this.findActorThumbnail(actorName),
          roles: movies.map(m => {
            const castEntry = m.cast.find(c => c.name === actorName);
            return {
              movieId: m.movieId,
              movieTitle: m.title,
              role: castEntry?.role || ''
            };
          })
        };

        this.selectedActor.set(actor);
        this.actorMovies.set(movies);
        this.panelType.set('actor');
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading actor movies:', err);
        this.isLoading.set(false);
      }
    });
  }

  // Cross-navigation: movie clicked from actor detail filmography
  onMovieSelectedFromActor(movie: Movie): void {
    this.isLoading.set(true);

    this.getMovieDetailUseCase.execute(movie.movieId).subscribe({
      next: (detail) => {
        this.selectedMovie.set(detail);
        this.panelType.set('movie');
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading movie detail:', err);
        this.isLoading.set(false);
      }
    });
  }

  onPlayMovieFromActor(movieId: number): void {
    this.addToPlaylistUseCase.execute(movieId, true).subscribe({
      error: (err) => console.error('Error playing movie:', err)
    });
  }

  onAddToPlaylist(event: { media: unknown; playMedia: boolean }): void {
    const movie = event.media as Movie;
    this.addToPlaylistUseCase.execute(movie.movieId, event.playMedia).subscribe({
      error: (err) => console.error('Error adding to playlist:', err)
    });
  }

  onPanelClosed(): void {
    this.isPanelOpen.set(false);
    this.selectedMovie.set(null);
    this.selectedActor.set(null);
    this.panelType.set('movie');
  }

  private findActorThumbnail(actorName: string): string {
    const currentMovie = this.selectedMovie();
    if (currentMovie) {
      const castEntry = currentMovie.cast.find(c => c.name === actorName);
      if (castEntry?.thumbnail) return castEntry.thumbnail;
    }
    return '';
  }
}
