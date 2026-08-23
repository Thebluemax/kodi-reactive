// ==========================================================================
// Files Domain Providers
// ==========================================================================

import { Provider } from '@angular/core';
import { FileRepository } from './domain/repositories/file.repository';
import { FileKodiRepository } from './infrastructure/repositories/file-kodi.repository';

export const FILE_PROVIDERS: Provider[] = [
  {
    provide: FileRepository,
    useClass: FileKodiRepository
  }
];
