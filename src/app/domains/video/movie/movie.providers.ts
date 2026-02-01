// ==========================================================================
// Movie Domain Providers
// ==========================================================================

import { Provider } from '@angular/core';
import { MovieRepository } from './domain/repositories/movie.repository';
import { MovieKodiRepository } from './infrastructure/repositories/movie-kodi.repository';

/**
 * Provides Movie domain dependencies
 * Use this in app.config.ts or feature module
 */
export const MOVIE_PROVIDERS: Provider[] = [
  {
    provide: MovieRepository,
    useClass: MovieKodiRepository
  }
];
