// ==========================================================================
// Artist Domain - Public API
// ==========================================================================

// Domain - Entities
export {
  Artist,
  ArtistListResult,
  ArtistSearchParams,
  ArtistAlbumGroup,
  ArtistFactory
} from './domain/entities/artist.entity';

// Domain - Repository (interface)
export { ArtistRepository } from './domain/repositories/artist.repository';

// Application - Use Cases
export { GetArtistsUseCase } from './application/use-cases/get-artists.use-case';
export { GetArtistDetailUseCase, ArtistDetailResult } from './application/use-cases/get-artist-detail.use-case';
export { AddArtistToPlaylistUseCase } from './application/use-cases/add-artist-to-playlist.use-case';
export { PlayTrackUseCase } from './application/use-cases/play-track.use-case';
export { AddTrackToPlaylistUseCase } from './application/use-cases/add-track-to-playlist.use-case';

// Presentation - Components
export { ArtistListComponent } from './presentation/components/artist-list/artist-list.component';
export { ArtistDetailComponent } from './presentation/components/artist-detail/artist-detail.component';

// Infrastructure - Providers
export { ARTIST_PROVIDERS } from './artist.providers';
