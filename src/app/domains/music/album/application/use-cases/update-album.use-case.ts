// ==========================================================================
// APPLICATION USE CASE - Update Album
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AlbumRepository } from '../../domain/repositories/album.repository';
import { AlbumUpdate } from '../../domain/entities/album.entity';

@Injectable({
  providedIn: 'root'
})
export class UpdateAlbumUseCase {
  private readonly albumRepository = inject(AlbumRepository);

  /**
   * Update an album with a partial patch
   * @param albumId - The album ID to update
   * @param patch - Only the fields to change
   */
  execute(albumId: number, patch: AlbumUpdate): Observable<void> {
    return this.albumRepository.updateAlbum(albumId, patch);
  }
}
