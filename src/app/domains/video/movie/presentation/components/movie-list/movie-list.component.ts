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
    MovieDetailComponent
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

  // State
  readonly movies = signal<Movie[]>([]);
  readonly selectedMovie = signal<Movie | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isPanelOpen = signal<boolean>(false);
  readonly totalMovies = signal<number>(9999);

  // Pagination
  private readonly limit = 40;
  private start = 0;
  private end = this.limit;
  private searchTerm = '';

  // Computed
  readonly hasMoreMovies = computed(() => this.start < this.totalMovies());

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

  onAddToPlaylist(event: { media: unknown; playMedia: boolean }): void {
    const movie = event.media as Movie;
    this.addToPlaylistUseCase.execute(movie.movieId, event.playMedia).subscribe({
      next: () => console.log('Movie added to playlist'),
      error: (err) => console.error('Error adding to playlist:', err)
    });
  }

  onPanelClosed(): void {
    this.isPanelOpen.set(false);
    this.selectedMovie.set(null);
  }
}
