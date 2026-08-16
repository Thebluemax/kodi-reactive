// ==========================================================================
// Library Domain Providers
// ==========================================================================

import { Provider } from '@angular/core';
import { LibraryRepository } from './domain/repositories/library.repository';
import { LibraryKodiRepository } from './infrastructure/repositories/library-kodi.repository';

/**
 * Provides Library domain dependencies
 * Use this in app.config.ts
 */
export const LIBRARY_PROVIDERS: Provider[] = [
  {
    provide: LibraryRepository,
    useClass: LibraryKodiRepository
  }
];
