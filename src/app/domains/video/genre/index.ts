// ==========================================================================
// VideoGenre Domain - Public API
// ==========================================================================

// Domain - Entities
export {
  VideoGenre,
  VideoGenreListResult,
  VideoGenreFactory,
  KodiVideoGenreResponse
} from './domain/entities/video-genre.entity';

// Domain - Repository (interface)
export { VideoGenreRepository } from './domain/repositories/video-genre.repository';

// Application - Use Cases
export { GetVideoGenresUseCase } from './application/use-cases/get-video-genres.use-case';
export { GetMoviesByGenreUseCase } from './application/use-cases/get-movies-by-genre.use-case';

// Presentation - Components
export { VideoGenreListComponent } from './presentation/components/video-genre-list/video-genre-list.component';
export { VideoGenreDetailComponent } from './presentation/components/video-genre-detail/video-genre-detail.component';

// Infrastructure - Providers
export { VIDEO_GENRE_PROVIDERS } from './video-genre.providers';
