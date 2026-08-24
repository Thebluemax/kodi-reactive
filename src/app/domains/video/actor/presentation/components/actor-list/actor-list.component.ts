import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  computed,
  effect
} from '@angular/core';
import {
  IonContent,
  IonList,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonProgressBar,
  InfiniteScrollCustomEvent
} from '@ionic/angular/standalone';

import { LateralPanelComponent } from '@shared/components/lateral-panel/lateral-panel.component';
import { MediaTileComponent } from '@shared/components/media-tile/media-tile.component';
import { Actor } from '../../../domain/entities/actor.entity';
import { Movie } from '@domains/video/movie/domain/entities/movie.entity';
import { GetMovieDetailUseCase } from '@domains/video/movie/application/use-cases/get-movie-detail.use-case';
import { AddMovieToPlaylistUseCase } from '@domains/video/movie/application/use-cases/add-movie-to-playlist.use-case';
import { MovieDetailComponent } from '@domains/video/movie/presentation/components/movie-detail/movie-detail.component';
import { GetActorsUseCase } from '../../../application/use-cases/get-actors.use-case';
import { GetMoviesByActorUseCase } from '../../../application/use-cases/get-movies-by-actor.use-case';
import { ActorDetailComponent } from '../actor-detail/actor-detail.component';
import { GlobalSearchService } from '@shared/services/global-search.service';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { NotificationService } from '@shared/services/notification.service';

@Component({
  selector: 'app-actor-list',
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
    ActorDetailComponent,
    MovieDetailComponent
  ],
  templateUrl: './actor-list.component.html',
  styleUrl: './actor-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActorListComponent implements OnInit {
  private readonly notifications = inject(NotificationService);
  private readonly getActorsUseCase = inject(GetActorsUseCase);
  private readonly getMoviesByActorUseCase = inject(GetMoviesByActorUseCase);
  private readonly getMovieDetailUseCase = inject(GetMovieDetailUseCase);
  private readonly addToPlaylistUseCase = inject(AddMovieToPlaylistUseCase);
  private readonly globalSearch = inject(GlobalSearchService);

  // All actors (full load)
  private readonly allActors = signal<Actor[]>([]);

  // Client-side pagination
  private readonly pageSize = 40;
  private readonly displayCount = signal<number>(this.pageSize);

  // Filtered actors based on search term
  private readonly filteredActors = computed(() => {
    const term = this.globalSearch.debouncedSearchTerm().toLowerCase();
    if (!term) return this.allActors();
    return this.allActors().filter(actor =>
      actor.name.toLowerCase().includes(term)
    );
  });

  // Displayed actors (sliced from filtered actors)
  readonly actors = computed(() => this.filteredActors().slice(0, this.displayCount()));
  readonly totalActors = computed(() => this.filteredActors().length);
  readonly hasMoreActors = computed(() => this.displayCount() < this.totalActors());

  constructor() {
    // Reset pagination when search term changes
    effect(() => {
      this.globalSearch.debouncedSearchTerm();
      this.displayCount.set(this.pageSize);
    });
  }

  // State
  readonly isLoading = signal<boolean>(false);
  /**
   * Motivo del ultimo fallo de carga. Sin esto una lista vacia por un fallo de
   * red se anunciaba como biblioteca vacia.
   */
  readonly loadError = signal<string>('');
  readonly isPanelOpen = signal<boolean>(false);

  // Panel type for cross-navigation
  readonly panelType = signal<'actor' | 'movie'>('actor');
  readonly selectedActor = signal<Actor | null>(null);
  readonly actorMovies = signal<Movie[]>([]);
  readonly selectedMovie = signal<Movie | null>(null);

  // Panel title computed
  readonly panelTitle = computed(() => {
    if (this.panelType() === 'movie' && this.selectedMovie()) {
      return this.selectedMovie()!.title;
    }
    return this.selectedActor()?.name ?? '';
  });

  ngOnInit(): void {
    this.loadActors();
  }

  private loadActors(): void {
    this.isLoading.set(true);

    this.getActorsUseCase.execute().subscribe({
      next: (result) => {
        this.allActors.set(result.actors);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.loadError.set(err.message || 'No se ha podido contactar con Kodi');
        this.isLoading.set(false);
      }
    });
  }

  onInfiniteScroll(event: InfiniteScrollCustomEvent): void {
    if (!this.hasMoreActors()) {
      event.target.disabled = true;
      return;
    }

    this.displayCount.update(current => current + this.pageSize);

    setTimeout(() => event.target.complete(), 200);
  }

  onActorSelected(actor: unknown): void {
    const selected = actor as Actor;
    this.isLoading.set(true);
    this.panelType.set('actor');
    this.selectedActor.set(selected);

    this.getMoviesByActorUseCase.execute(selected.name).subscribe({
      next: (movies) => {
        this.actorMovies.set(movies);
        this.isPanelOpen.set(true);
        this.isLoading.set(false);
      },
      error: (err) => {
        void this.notifications.error('No se han podido cargar las películas del actor');
        this.isLoading.set(false);
      }
    });
  }

  // Cross-navigation: movie selected from actor detail
  onMovieSelectedFromActor(movie: Movie): void {
    this.isLoading.set(true);

    this.getMovieDetailUseCase.execute(movie.movieId).subscribe({
      next: (detail) => {
        this.selectedMovie.set(detail);
        this.panelType.set('movie');
        this.isLoading.set(false);
      },
      error: (err) => {
        void this.notifications.error('No se ha podido cargar la película');
        this.isLoading.set(false);
      }
    });
  }

  // Cross-navigation: actor selected from movie detail (back to actor)
  onActorSelectedFromMovie(actorName: string): void {
    const actor = this.allActors().find(a => a.name === actorName);
    if (actor) {
      this.selectedActor.set(actor);
      this.panelType.set('actor');
      this.isLoading.set(true);

      this.getMoviesByActorUseCase.execute(actor.name).subscribe({
        next: (movies) => {
          this.actorMovies.set(movies);
          this.isLoading.set(false);
        },
        error: (err) => {
          void this.notifications.error('No se han podido cargar las películas del actor');
          this.isLoading.set(false);
        }
      });
    }
  }

  onPlayMovieFromActor(movieId: number): void {
    this.addToPlaylistUseCase.execute(movieId, true).subscribe({
      error: () => void this.notifications.error('No se ha podido reproducir la película')
    });
  }

  onAddToPlaylist(event: { media: unknown; playMedia: boolean }): void {
    const movie = event.media as Movie;
    this.addToPlaylistUseCase.execute(movie.movieId, event.playMedia).subscribe({
      error: () => void this.notifications.error('No se ha podido añadir a la cola')
    });
  }

  onPanelClosed(): void {
    this.isPanelOpen.set(false);
    this.selectedActor.set(null);
    this.selectedMovie.set(null);
    this.panelType.set('actor');
  }

  /** Vuelve a intentar la carga que fallo. */
  onRetry(): void {
    this.loadActors();
  }
}
