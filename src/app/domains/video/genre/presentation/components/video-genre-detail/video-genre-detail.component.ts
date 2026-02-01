import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  input,
  signal,
  computed
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  IonContent,
  IonImg,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonButton,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonProgressBar,
  InfiniteScrollCustomEvent
} from '@ionic/angular/standalone';

import { VideoGenre } from '../../../domain/entities/video-genre.entity';
import { GetMoviesByGenreUseCase } from '../../../application/use-cases/get-movies-by-genre.use-case';
import { Movie, MovieSearchParams, AddMovieToPlaylistUseCase } from '@domains/video/movie';
import { AssetsPipe } from '@shared/pipes/assets.pipe';

@Component({
  selector: 'app-video-genre-detail',
  standalone: true,
  imports: [
    IonContent,
    IonImg,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonButton,
    IonIcon,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonProgressBar,
    AssetsPipe,
    DecimalPipe
  ],
  templateUrl: './video-genre-detail.component.html',
  styleUrl: './video-genre-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoGenreDetailComponent implements OnInit {
  private readonly getMoviesByGenreUseCase = inject(GetMoviesByGenreUseCase);
  private readonly addToPlaylistUseCase = inject(AddMovieToPlaylistUseCase);

  // Input
  readonly genre = input.required<VideoGenre>();

  // State
  readonly movies = signal<Movie[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly totalMovies = signal<number>(9999);

  // Pagination
  private readonly limit = 40;
  private start = 0;
  private end = this.limit;

  // Computed
  readonly hasMoreMovies = computed(() => this.start < this.totalMovies());

  ngOnInit(): void {
    this.resetAndLoad();
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

  onPlayMovie(movieId: number): void {
    this.addToPlaylistUseCase.execute(movieId, true).subscribe({
      error: (err) => console.error('Error playing movie:', err)
    });
  }

  onAddToQueue(movieId: number): void {
    this.addToPlaylistUseCase.execute(movieId, false).subscribe({
      error: (err) => console.error('Error adding movie to queue:', err)
    });
  }

  private resetAndLoad(): void {
    this.start = 0;
    this.end = this.limit;
    this.movies.set([]);
    this.totalMovies.set(9999);
    this.loadMovies();
  }

  private loadMovies(): void {
    this.isLoading.set(true);
    const params: MovieSearchParams = {
      start: this.start,
      end: this.end
    };

    this.getMoviesByGenreUseCase.execute(this.genre().title, params).subscribe({
      next: (result) => {
        this.totalMovies.set(result.total);
        this.movies.update(current => [...current, ...result.movies]);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading movies by genre:', err);
        this.isLoading.set(false);
      }
    });
  }
}
