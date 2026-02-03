// ==========================================================================
// VideoGenre Domain Providers
// ==========================================================================

import { Provider } from '@angular/core';
import { VideoGenreRepository } from './domain/repositories/video-genre.repository';
import { VideoGenreKodiRepository } from './infrastructure/repositories/video-genre-kodi.repository';

/**
 * Provides VideoGenre domain dependencies
 * Use this in app.config.ts or feature module
 */
export const VIDEO_GENRE_PROVIDERS: Provider[] = [
  {
    provide: VideoGenreRepository,
    useClass: VideoGenreKodiRepository
  }
];
