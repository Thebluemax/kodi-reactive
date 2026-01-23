// ==========================================================================
// APPLICATION USE CASE - Get Album Detail
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { AlbumRepository } from '../../domain/repositories/album.repository';
import { Album } from '../../domain/entities/album.entity';
import { Track } from '@domains/music/track/domain/entities/track.entity';

export interface AlbumDetailResult {
  album: Album;
  tracks: Track[];
  totalTracks: number;
}

@Injectable({
  providedIn: 'root'
})
export class GetAlbumDetailUseCase {
  private readonly albumRepository = inject(AlbumRepository);

  execute(albumId: number): Observable<AlbumDetailResult> {
    return forkJoin({
      album: this.albumRepository.getAlbumById(albumId),
      tracks: this.albumRepository.getAlbumTracks(albumId)
    }).pipe(
      map(({ album, tracks }) => ({
        album,
        tracks,
        totalTracks: tracks.length
      }))
    );
  }
}
