// ==========================================================================
// APPLICATION USE CASE - Get Albums
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AlbumRepository } from '../../domain/repositories/album.repository';
import { AlbumListResult, AlbumSearchParams } from '../../domain/entities/album.entity';

@Injectable({
  providedIn: 'root'
})
export class GetAlbumsUseCase {
  private readonly albumRepository = inject(AlbumRepository);

  execute(params: AlbumSearchParams): Observable<AlbumListResult> {
    return this.albumRepository.getAlbums(params);
  }
}
