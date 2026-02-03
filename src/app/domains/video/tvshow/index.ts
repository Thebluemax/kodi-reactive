// ==========================================================================
// TVShow Domain - Public API
// ==========================================================================

// Domain - Entities
export {
  TVShow,
  TVShowListResult,
  TVShowSearchParams,
  TVShowSearchField,
  TVShowSearchOperator,
  TVShowFactory,
  Season,
  SeasonFactory,
  Episode,
  EpisodeFactory,
  KodiTVShowResponse,
  KodiSeasonResponse,
  KodiEpisodeResponse
} from './domain/entities/tvshow.entity';

// Domain - Repository (interface)
export { TVShowRepository } from './domain/repositories/tvshow.repository';

// Application - Use Cases
export { GetTVShowsUseCase } from './application/use-cases/get-tvshows.use-case';
export { GetTVShowDetailUseCase } from './application/use-cases/get-tvshow-detail.use-case';
export { GetSeasonsUseCase } from './application/use-cases/get-seasons.use-case';
export { GetEpisodesUseCase } from './application/use-cases/get-episodes.use-case';
export { AddEpisodeToPlaylistUseCase } from './application/use-cases/add-episode-to-playlist.use-case';

// Presentation - Components
export { TVShowListComponent } from './presentation/components/tvshow-list/tvshow-list.component';
export { TVShowDetailComponent } from './presentation/components/tvshow-detail/tvshow-detail.component';

// Infrastructure - Providers
export { TVSHOW_PROVIDERS } from './tvshow.providers';
