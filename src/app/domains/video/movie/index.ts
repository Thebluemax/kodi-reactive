// ==========================================================================
// Movie Domain - Public API
// ==========================================================================

// Domain - Entities
export {
  Movie,
  MovieListResult,
  MovieSearchParams,
  MovieSearchField,
  MovieSearchOperator,
  MovieFactory,
  CastMember,
  KodiMovieResponse,
  KodiCastResponse
} from './domain/entities/movie.entity';

// Domain - Repository (interface)
export { MovieRepository } from './domain/repositories/movie.repository';

// Application - Use Cases
export { GetMoviesUseCase } from './application/use-cases/get-movies.use-case';
export { GetMovieDetailUseCase } from './application/use-cases/get-movie-detail.use-case';
export { AddMovieToPlaylistUseCase } from './application/use-cases/add-movie-to-playlist.use-case';

// Presentation - Components
export { MovieListComponent } from './presentation/components/movie-list/movie-list.component';
export { MovieDetailComponent } from './presentation/components/movie-detail/movie-detail.component';

// Infrastructure - Providers
export { MOVIE_PROVIDERS } from './movie.providers';
