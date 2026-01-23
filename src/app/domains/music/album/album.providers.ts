// ==========================================================================
// Album Domain Providers
// ==========================================================================

import { Provider } from '@angular/core';
import { AlbumRepository } from './domain/repositories/album.repository';
import { AlbumKodiRepository } from './infrastructure/repositories/album-kodi.repository';

/**
 * Provides Album domain dependencies
 * Use this in app.config.ts or feature module
 */
export const ALBUM_PROVIDERS: Provider[] = [
  {
    provide: AlbumRepository,
    useClass: AlbumKodiRepository
  }
];
