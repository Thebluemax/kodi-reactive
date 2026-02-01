// ==========================================================================
// APPLICATION USE CASE - Get Video Genres
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { VideoGenreRepository } from '../../domain/repositories/video-genre.repository';
import { VideoGenreListResult } from '../../domain/entities/video-genre.entity';

@Injectable({
  providedIn: 'root'
})
export class GetVideoGenresUseCase {
  private readonly videoGenreRepository = inject(VideoGenreRepository);

  execute(): Observable<VideoGenreListResult> {
    return this.videoGenreRepository.getGenres();
  }
}
