// ==========================================================================
// Actor Domain Providers
// ==========================================================================

import { Provider } from '@angular/core';
import { ActorRepository } from './domain/repositories/actor.repository';
import { ActorKodiRepository } from './infrastructure/repositories/actor-kodi.repository';

/**
 * Provides Actor domain dependencies
 * Use this in app.config.ts or feature module
 */
export const ACTOR_PROVIDERS: Provider[] = [
  {
    provide: ActorRepository,
    useClass: ActorKodiRepository
  }
];
