// ==========================================================================
// APPLICATION USE CASE - Get Genres
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { GenreRepository } from '../../domain/repositories/genre.repository';
import { GenreListResult } from '../../domain/entities/genre.entity';

@Injectable({
  providedIn: 'root'
})
export class GetGenresUseCase {
  private readonly genreRepository = inject(GenreRepository);

  execute(): Observable<GenreListResult> {
    return this.genreRepository.getGenres();
  }
}
