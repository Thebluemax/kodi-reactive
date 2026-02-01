import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  computed
} from '@angular/core';
import {
  IonContent,
  IonList,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonProgressBar,
  InfiniteScrollCustomEvent
} from '@ionic/angular/standalone';

import { MediaTileComponent, LateralPanelComponent } from '@domains/music/shared';
import { Movie, MovieSearchParams } from '../../../domain/entities/movie.entity';
import { GetMoviesUseCase } from '../../../application/use-cases/get-movies.use-case';
import { GetMovieDetailUseCase } from '../../../application/use-cases/get-movie-detail.use-case';
import { AddMovieToPlaylistUseCase } from '../../../application/use-cases/add-movie-to-playlist.use-case';
import { MovieDetailComponent } from '../movie-detail/movie-detail.component';
import { Actor } from '@domains/video/actor/domain/entities/actor.entity';
import { GetMoviesByActorUseCase } from '@domains/video/actor/application/use-cases/get-movies-by-actor.use-case';
import { ActorDetailComponent } from '@domains/video/actor/presentation/components/actor-detail/actor-detail.component';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [
    IonContent,
    IonList,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonProgressBar,
    MediaTileComponent,
    LateralPanelComponent,
    MovieDetailComponent,
    ActorDetailComponent
  ],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieListComponent implements OnInit {
  // Use Cases
  private readonly getMoviesUseCase = inject(GetMoviesUseCase);
  private readonly getMovieDetailUseCase = inject(GetMovieDetailUseCase);
  private readonly addToPlaylistUseCase = inject(AddMovieToPlaylistUseCase);
  private readonly getMoviesByActorUseCase = inject(GetMoviesByActorUseCase);

  // State
  readonly movies = signal<Movie[]>([]);
  readonly selectedMovie = signal<Movie | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isPanelOpen = signal<boolean>(false);
  readonly totalMovies = signal<number>(9999);

  // Cross-navigation: actor panel
  readonly panelType = signal<'movie' | 'actor'>('movie');
  readonly selectedActor = signal<Actor | null>(null);
  readonly actorMovies = signal<Movie[]>([]);

  // Pagination
  private readonly limit = 40;
  private start = 0;
  private end = this.limit;
  private searchTerm = '';

  // Computed
  readonly hasMoreMovies = computed(() => this.start < this.totalMovies());
  readonly panelTitle = computed(() => {
    if (this.panelType() === 'actor' && this.selectedActor()) {
      return this.selectedActor()!.name;
    }
    return this.selectedMovie()?.title ?? '';
  });

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    const params: MovieSearchParams = {
      start: this.start,
      end: this.end,
      searchTerm: this.searchTerm || undefined
    };

    this.getMoviesUseCase.execute(params).subscribe({
      next: (result) => {
        this.totalMovies.set(result.total);
        this.movies.update(current => [...current, ...result.movies]);
      },
      error: (err) => console.error('Error loading movies:', err)
    });
  }

  onInfiniteScroll(event: InfiniteScrollCustomEvent): void {
    if (!this.hasMoreMovies()) {
      event.target.disabled = true;
      return;
    }

    this.start = this.end + 1;
    this.end = this.end + this.limit;
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
