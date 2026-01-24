// ==========================================================================
// Album Domain - Public API
// ==========================================================================

// Domain - Entities
export {
  Album,
  AlbumListResult,
  AlbumSearchParams,
  AlbumSearchField,
  AlbumSearchOperator,
  AlbumFactory
} from './domain/entities/album.entity';

// Domain - Repository (interface)
export { AlbumRepository } from './domain/repositories/album.repository';

// Application - Use Cases
export { GetAlbumsUseCase } from './application/use-cases/get-albums.use-case';
export { GetAlbumDetailUseCase, AlbumDetailResult } from './application/use-cases/get-album-detail.use-case';
export { AddAlbumToPlaylistUseCase } from './application/use-cases/add-album-to-playlist.use-case';

// Presentation - Components
export { AlbumListComponent } from './presentation/components/album-list/album-list.component';
export { AlbumDetailComponent } from './presentation/components/album-detail/album-detail.component';

// Infrastructure - Providers
export { ALBUM_PROVIDERS } from './album.providers';
