// ==========================================================================
// Remote Domain Providers
// ==========================================================================

import { Provider } from '@angular/core';
import { InputRepository } from './domain/repositories/input.repository';
import { InputKodiRepository } from './infrastructure/repositories/input-kodi.repository';

/**
 * Provides Remote domain dependencies
 * Use this in app.config.ts
 */
export const REMOTE_PROVIDERS: Provider[] = [
  {
    provide: InputRepository,
    useClass: InputKodiRepository
  }
];
