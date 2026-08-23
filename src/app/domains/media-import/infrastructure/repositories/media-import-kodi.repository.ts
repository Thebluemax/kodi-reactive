// ==========================================================================
// INFRASTRUCTURE - Media Import Kodi Repository
// ==========================================================================
// Trae el indice de la biblioteca contra el que se emparejan las entradas del
// archivo.
//
// Una peticion por tipo de medio presente en el archivo, con las propiedades
// completas, en lugar de una por elemento emparejado. Un archivo de cien
// entradas serian cien peticiones; asi son como mucho cinco, y el emparejado y
// el diff se resuelven despues en memoria.
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { KodiConfigService } from '@shared/services/kodi-config.service';
import { Methods } from '@shared/enums/methods';
import {
  LibraryIndexItem,
  MatchBy,
  MediaKind
} from '../../domain/entities/media-import.entity';
import { normalizeKey } from '../../domain/services/media-import-matcher';
import { MovieFactory } from '@domains/video/movie/domain/entities/movie.entity';
import { TVShowFactory } from '@domains/video/tvshow/domain/entities/tvshow.entity';
import { AlbumFactory } from '@domains/music/album/domain/entities/album.entity';
import { ArtistFactory } from '@domains/music/artist/domain/entities/artist.entity';
import { TrackFactory } from '@domains/music/track/domain/entities/track.entity';

interface KodiEnvelope {
  result?: Record<string, unknown>;
  error?: { code: number; message: string };
}

/** Como se pide y se interpreta cada tipo de medio. */
interface KindLoader {
  readonly method: Methods;
  readonly properties: string[];
  readonly collection: string;
  readonly matchBy: MatchBy;
  readonly toItem: (raw: Record<string, unknown>) => LibraryIndexItem;
}

@Injectable({
  providedIn: 'root'
})
export class MediaImportKodiRepository {
  private readonly http = inject(HttpClient);
  private readonly config = inject(KodiConfigService);
  private requestId = 1;

  private readonly loaders: Record<MediaKind, KindLoader> = {
    [MediaKind.Movie]: {
      method: Methods.VideoLibraryGetMovies,
      properties: [
        'title', 'originaltitle', 'sorttitle', 'genre', 'year', 'premiered',
        'rating', 'userrating', 'votes', 'top250', 'runtime', 'plot',
        'plotoutline', 'director', 'writer', 'studio', 'country', 'tag',
        'showlink', 'mpaa', 'imdbnumber', 'trailer', 'set', 'tagline',
        'thumbnail', 'fanart', 'art', 'file'
      ],
      collection: 'movies',
      matchBy: MatchBy.File,
      toItem: raw => {
        const movie = MovieFactory.fromKodiResponse(raw as never);
        return this.toIndexItem(MediaKind.Movie, movie.movieId, movie.file, movie.title, movie);
      }
    },
    [MediaKind.TVShow]: {
      method: Methods.VideoLibraryGetTVShows,
      properties: [
        'title', 'originaltitle', 'sorttitle', 'genre', 'year', 'premiered',
        'rating', 'userrating', 'votes', 'plot', 'studio', 'tag', 'mpaa',
        'imdbnumber', 'episodeguide', 'status', 'runtime', 'thumbnail',
        'fanart', 'art', 'file'
      ],
      collection: 'tvshows',
      matchBy: MatchBy.File,
      toItem: raw => {
        const tvshow = TVShowFactory.fromKodiResponse(raw as never);
        return this.toIndexItem(MediaKind.TVShow, tvshow.tvshowId, tvshow.file, tvshow.title, tvshow);
      }
    },
    [MediaKind.Song]: {
      method: Methods.AudioLibraryGetSongs,
      properties: [
        'title', 'artist', 'genre', 'year', 'rating', 'track', 'duration',
        'file', 'album', 'albumid', 'artistid', 'thumbnail', 'lastplayed'
      ],
      collection: 'songs',
      matchBy: MatchBy.File,
      toItem: raw => {
        const track = TrackFactory.fromKodiResponse(raw as never);
        return this.toIndexItem(MediaKind.Song, track.songId, track.file, track.title, track);
      }
    },
    [MediaKind.Album]: {
      method: Methods.AudioLibraryGetAlbums,
      properties: [
        'title', 'description', 'artist', 'genre', 'theme', 'mood', 'style',
        'type', 'albumlabel', 'rating', 'userrating', 'votes', 'year',
        'musicbrainzalbumid', 'musicbrainzreleasegroupid',
        'musicbrainzalbumartistid', 'sortartist', 'displayartist', 'isboxset',
        'releasedate', 'originaldate', 'thumbnail', 'fanart', 'art'
      ],
      collection: 'albums',
      matchBy: MatchBy.Title,
      toItem: raw => {
        const album = AlbumFactory.fromKodiResponse(raw as never);
        return this.toIndexItem(MediaKind.Album, album.albumId, album.title, album.title, album);
      }
    },
    [MediaKind.Artist]: {
      method: Methods.AudioLibraryGetArtists,
      properties: [
        'instrument', 'style', 'mood', 'born', 'formed', 'description',
        'genre', 'died', 'disbanded', 'yearsactive', 'musicbrainzartistid',
        'sortname', 'type', 'gender', 'disambiguation', 'thumbnail', 'fanart',
        'art'
      ],
      collection: 'artists',
      matchBy: MatchBy.Title,
      toItem: raw => {
        const artist = ArtistFactory.fromKodiResponse(raw as never);
        return this.toIndexItem(MediaKind.Artist, artist.artistId, artist.name, artist.name, artist);
      }
    }
  };

  /** Indice de los tipos de medio que el archivo menciona, y solo de esos. */
  loadIndex(kinds: readonly MediaKind[]): Observable<LibraryIndexItem[]> {
    const unique = [...new Set(kinds)];

    if (unique.length === 0) {
      return of([]);
    }

    return forkJoin(unique.map(kind => this.loadKind(kind))).pipe(
      map(lists => ([] as LibraryIndexItem[]).concat(...lists))
    );
  }

  private loadKind(kind: MediaKind): Observable<LibraryIndexItem[]> {
    const loader = this.loaders[kind];
    const request = {
      jsonrpc: '2.0',
      method: loader.method,
      params: { properties: loader.properties },
      id: this.requestId++
    };

    return this.http.post<KodiEnvelope>(this.config.jsonRpcUrl, request).pipe(
      map(response => {
        if (response.error) {
          throw new Error(
            `Kodi no ha devuelto la biblioteca de ${kind}: ${response.error.message}`
          );
        }

        const list = (response.result?.[loader.collection] ?? []) as Record<string, unknown>[];

        return list.map(raw => loader.toItem(raw));
      })
    );
  }

  private toIndexItem(
    kind: MediaKind,
    id: number,
    keySource: string,
    label: string,
    current: object
  ): LibraryIndexItem {
    const matchBy = this.loaders[kind].matchBy;

    return {
      id,
      kind,
      key: normalizeKey(kind, matchBy, keySource),
      label,
      current: current as Record<string, unknown>
    };
  }
}
