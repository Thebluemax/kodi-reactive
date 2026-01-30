// ==========================================================================
// INFRASTRUCTURE - Genre Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
import { environment } from 'src/environments/environment';

// TODO: Move to core/infrastructure/config
const KODI_API_URL = `${environment.serverApiUrl}:${environment.apiPort}/jsonrpc`;

interface KodiJsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, unknown>;
  id: number;
}

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
  private readonly http = inject(HttpClient);
  private requestId = 1;

  getGenres(): Observable<GenreListResult> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: '2.0',
      method: 'AudioLibrary.GetGenres',
      params: {
        properties: ['thumbnail', 'title'],
        sort: {
          method: 'title',
          order: 'ascending',
          ignorearticle: true
        }
      },
      id: this.getNextId()
    };

    return this.http.post<KodiGenresResponse>(KODI_API_URL, request).pipe(
      map(response => ({
        genres: GenreFactory.fromKodiResponseList(response.result.genres || []),
        total: response.result.limits.total
      }))
    );
  }

  getGenreAlbums(genreId: number, genreTitle: string): Observable<Album[]> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: '2.0',
      method: 'AudioLibrary.GetAlbums',
      params: {
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
      },
      id: this.getNextId()
    };

    return this.http.post<KodiAlbumsResponse>(KODI_API_URL, request).pipe(
      map(response => AlbumFactory.fromKodiResponseList(response.result.albums || []))
    );
  }

  getGenreArtists(genreId: number, genreLabel: string): Observable<Artist[]> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: '2.0',
      method: 'AudioLibrary.GetArtists',
      params: {
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
      },
      id: this.getNextId()
    };

    return this.http.post<KodiArtistsResponse>(KODI_API_URL, request).pipe(
      map(response => ArtistFactory.fromKodiResponseList(response.result.artists || []))
    );
  }

  private getNextId(): number {
    return this.requestId++;
  }
}
