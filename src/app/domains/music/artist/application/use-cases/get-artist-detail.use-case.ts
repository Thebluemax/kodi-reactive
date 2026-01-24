// ==========================================================================
// APPLICATION USE CASE - Get Artist Detail
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ArtistRepository } from '../../domain/repositories/artist.repository';
import { Artist, ArtistAlbumGroup } from '../../domain/entities/artist.entity';

export interface ArtistDetailResult {
  artist: Artist;
  albums: ArtistAlbumGroup[];
  totalAlbums: number;
}

@Injectable({
  providedIn: 'root'
})
export class GetArtistDetailUseCase {
  private readonly artistRepository = inject(ArtistRepository);

  execute(artistId: number): Observable<ArtistDetailResult> {
    return forkJoin({
      artist: this.artistRepository.getArtistById(artistId),
      albums: this.artistRepository.getArtistAlbums(artistId)
    }).pipe(
      map(({ artist, albums }) => ({
        artist,
        albums,
        totalAlbums: albums.length
      }))
    );
  }
}
