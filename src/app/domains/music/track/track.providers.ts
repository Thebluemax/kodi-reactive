// ==========================================================================
// Track Domain Providers
// ==========================================================================

import { Provider } from '@angular/core';
import { TrackRepository } from './domain/repositories/track.repository';
import { TrackKodiRepository } from './infrastructure/repositories/track-kodi.repository';

/**
 * Provides Track domain dependencies
 * Use this in app.config.ts or feature module
 */
export const TRACK_PROVIDERS: Provider[] = [
  {
    provide: TrackRepository,
    useClass: TrackKodiRepository
  }
];