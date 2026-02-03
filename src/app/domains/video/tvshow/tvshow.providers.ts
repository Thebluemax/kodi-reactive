// ==========================================================================
// TVShow Domain Providers
// ==========================================================================

import { Provider } from '@angular/core';
import { TVShowRepository } from './domain/repositories/tvshow.repository';
import { TVShowKodiRepository } from './infrastructure/repositories/tvshow-kodi.repository';

/**
 * Provides TVShow domain dependencies
 * Use this in app.config.ts or feature module
 */
export const TVSHOW_PROVIDERS: Provider[] = [
  {
    provide: TVShowRepository,
    useClass: TVShowKodiRepository
  }
];
