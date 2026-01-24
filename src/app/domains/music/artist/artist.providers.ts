// ==========================================================================
// Artist Domain Providers
// ==========================================================================

import { Provider } from '@angular/core';
import { ArtistRepository } from './domain/repositories/artist.repository';
import { ArtistKodiRepository } from './infrastructure/repositories/artist-kodi.repository';

/**
 * Provides Artist domain dependencies
 * Use this in app.config.ts or feature module
 */
export const ARTIST_PROVIDERS: Provider[] = [
  {
    provide: ArtistRepository,
    useClass: ArtistKodiRepository
  }
];
