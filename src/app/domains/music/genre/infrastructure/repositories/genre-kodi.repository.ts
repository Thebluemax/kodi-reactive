// ==========================================================================
// INFRASTRUCTURE - Genre Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { GenreRepository } from '../../domain/repositories/genre.repository';
import {
  Genre,
  GenreListResult,
  GenreFactory,
  KodiGenreResponse
} from '../../domain/entities/genre.entity';
import { Album, AlbumFactory, KodiAlbumResponse } from '@domains/music/album/domain/entities/album.entity';
import { Artist, ArtistFactory, KodiArtistResponse } from '@domains/music/artist/domain/entities/artist.entity';
import { KodiRpcService } from '@shared/services/kodi-rpc.service';

interface KodiGenresResponse {
  result: {
    genres: KodiGenreResponse[];
    limits: {
      start: number;
      end: number;
      total: number;
    };
  };
}

interface KodiAlbumsResponse {
  result: {
    albums: KodiAlbumResponse[];
    limits: {
      start: number;
      end: number;
      total: number;
    };
  };
}

interface KodiArtistsResponse {
  result: {
    artists: KodiArtistResponse[];
    limits: {
      start: number;
      end: number;
      total: number;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class GenreKodiRepository extends GenreRepository {
  private readonly rpc = inject(KodiRpcService);

  getGenres(): Observable<GenreListResult> {
    return this.rpc.query<KodiGenresResponse['result']>('AudioLibrary.GetGenres', {
      properties: ['thumbnail', 'title'],
      sort: {
        method: 'title',
        order: 'ascending',
        ignorearticle: true
      }
    }).pipe(
      map(result => {
        return {
          genres: GenreFactory.fromKodiResponseList(result.genres || []),
          total: result.limits.total
        };
      })
    );
  }

  getGenreAlbums(genreId: number, genreTitle: string): Observable<Album[]> {
    return this.rpc.query<KodiAlbumsResponse['result']>('AudioLibrary.GetAlbums', {
      properties: [
        'title', 'description', 'artist', 'genre', 'theme', 'mood',
        'style', 'type', 'albumlabel', 'rating', 'year',
        'fanart', 'thumbnail', 'playcount', 'artistid', 'dateadded'
      ],
      filter: {
        field: 'genre',
        operator: 'is',
        value: genreTitle
      },
      sort: { order: 'ascending', method: 'album' }
    }).pipe(
      map(result =>
        AlbumFactory.fromKodiResponseList(result.albums || [])
      )
    );
  }

  getGenreArtists(genreId: number, genreLabel: string): Observable<Artist[]> {
    return this.rpc.query<KodiArtistsResponse['result']>('AudioLibrary.GetArtists', {
      properties: [
        'thumbnail', 'fanart', 'genre', 'style', 'mood',
        'born', 'formed', 'description', 'disbanded', 'died',
        'yearsactive', 'instrument', 'musicbrainzartistid'
      ],
      filter: {
        field: 'genre',
        operator: 'is',
        value: genreLabel
      },
      sort: { order: 'ascending', method: 'artist' }
    }).pipe(
      map(result =>
        ArtistFactory.fromKodiResponseList(result.artists || [])
      )
    );
  }
}
