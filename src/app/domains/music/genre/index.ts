// ==========================================================================
// Genre Domain - Public API
// ==========================================================================

// Domain - Entities
export {
  Genre,
  GenreListResult,
  GenreFactory
} from './domain/entities/genre.entity';

// Domain - Repository (interface)
export { GenreRepository } from './domain/repositories/genre.repository';

// Application - Use Cases
export { GetGenresUseCase } from './application/use-cases/get-genres.use-case';
export { GetGenreDetailUseCase, GenreDetailResult } from './application/use-cases/get-genre-detail.use-case';

// Presentation - Components
export { GenreListComponent } from './presentation/components/genre-list/genre-list.component';
export { GenreDetailComponent } from './presentation/components/genre-detail/genre-detail.component';
export { GenreDetailPanelComponent } from './presentation/components/genre-detail-panel/genre-detail-panel.component';

// Infrastructure - Providers
export { GENRE_PROVIDERS } from './genre.providers';
