// ==========================================================================
// APPLICATION USE CASE - Clean Library
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LibraryRepository } from '../../domain/repositories/library.repository';
import { LibraryType } from '../../domain/entities/library-type.entity';

@Injectable({
  providedIn: 'root'
})
export class CleanLibraryUseCase {
  private readonly libraryRepository = inject(LibraryRepository);

  execute(type: LibraryType): Observable<void> {
    return this.libraryRepository.clean(type);
  }
}
