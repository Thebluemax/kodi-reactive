// ==========================================================================
// Player Domain Providers
// ==========================================================================

import { Provider } from '@angular/core';
import { PlayerRepository } from './domain/repositories/player.repository';
import { PlayerKodiRepository } from './infrastructure/repositories/player-kodi.repository';

/**
 * Provides Player domain dependencies
 * Use this in app.config.ts or feature module
 */
export const PLAYER_PROVIDERS: Provider[] = [
  {
    provide: PlayerRepository,
    useClass: PlayerKodiRepository
  }
];
