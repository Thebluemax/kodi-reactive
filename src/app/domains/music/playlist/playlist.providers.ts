// ==========================================================================
// Playlist Domain Providers
// ==========================================================================

import { Provider } from '@angular/core';
import { PlaylistRepository } from './domain/repositories/playlist.repository';
import { PlaylistKodiRepository } from './infrastructure/repositories/playlist-kodi.repository';

/**
 * Provides Playlist domain dependencies
 * Use this in app.config.ts or feature module
 */
export const PLAYLIST_PROVIDERS: Provider[] = [
  {
    provide: PlaylistRepository,
    useClass: PlaylistKodiRepository
  }
];
