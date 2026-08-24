// ==========================================================================
// INFRASTRUCTURE - Album Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AlbumRepository } from '../../domain/repositories/album.repository';
import {
  Album,
  AlbumListResult,
  AlbumSearchParams,
  AlbumUpdate,
  AlbumFactory,
  KodiAlbumResponse
} from '../../domain/entities/album.entity';
import { Track, TrackFactory, KodiTrackResponse } from '@domains/music/track/domain/entities/track.entity';
import { environment } from 'src/environments/environment';
import { KodiConfigService } from '@shared/services/kodi-config.service';
import { Methods } from '@shared/enums/methods';
import { KodiEnvelope, assertKodiOk, unwrapKodiResult } from '@shared/utils/kodi-envelope';

/**
 * Kodi responde a los errores con HTTP 200 y el fallo dentro del sobre, asi que
 * un rechazo no llega como error de red y hay que leerlo del cuerpo.
 */
interface KodiJsonRpcEnvelope {
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
}

/**
 * Traduccion del vocabulario del dominio al de AudioLibrary.SetAlbumDetails.
 * Los nombres de la API son minusculas sin separador; los del dominio siguen la
 * convencion del resto de entidades.
 */
const UPDATE_PARAM_NAMES: Record<keyof AlbumUpdate, string> = {
  title: 'title',
  artists: 'artist',
  description: 'description',
  genres: 'genre',
  themes: 'theme',
  moods: 'mood',
  styles: 'style',
  type: 'type',
  label: 'albumlabel',
  rating: 'rating',
  year: 'year',
  userRating: 'userrating',
  votes: 'votes',
  musicBrainzAlbumId: 'musicbrainzalbumid',
  musicBrainzReleaseGroupId: 'musicbrainzreleasegroupid',
  sortArtist: 'sortartist',
  displayArtist: 'displayartist',
  musicBrainzAlbumArtistIds: 'musicbrainzalbumartistid',
  art: 'art',
  isBoxSet: 'isboxset',
  releaseDate: 'releasedate',
  originalDate: 'originaldate'
};

/**
 * El detalle alimenta el editor, asi que pide todo lo que SetAlbumDetails sabe
 * escribir. Los 22 campos escribibles figuran en Audio.Fields.Album, de modo
 * que no hay ninguno que se pueda escribir y no leer.
 */
const ALBUM_DETAIL_PROPERTIES = [
  'title', 'description', 'artist', 'artistid', 'genre', 'theme', 'mood',
  'style', 'type', 'albumlabel', 'rating', 'userrating', 'votes', 'year',
  'musicbrainzalbumid', 'musicbrainzreleasegroupid', 'musicbrainzalbumartistid',
  'sortartist', 'displayartist', 'isboxset', 'releasedate', 'originaldate',
  'thumbnail', 'fanart', 'playcount', 'dateadded', 'art'
];

/**
 * La lista pagina de 40 en 40 y sus tarjetas solo pintan titulo, artistas,
 * caratula y año. Pedir mas multiplicaria la carga util de cada pagina sin que
 * nadie lo lea: al abrir el detalle se recarga el album entero de todas formas.
 */
const ALBUM_LIST_PROPERTIES = [
  'artist', 'artistid', 'thumbnail', 'year'
];

interface KodiJsonRpcRequest {
  jsonrpc: string;
  method: string;
  params?: Record<string, unknown>;
  id: number;
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

interface KodiAlbumDetailResponse {
  result: {
    albumdetails: KodiAlbumResponse;
  };
}

interface KodiTracksResponse {
  result: {
    songs: KodiTrackResponse[];
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
export class AlbumKodiRepository extends AlbumRepository {
  private readonly http = inject(HttpClient);
  private readonly config = inject(KodiConfigService);
  private requestId = 1;

  getAlbums(params: AlbumSearchParams): Observable<AlbumListResult> {
    const request = this.buildAlbumsRequest(params);

    return this.http.post<KodiAlbumsResponse>(this.config.jsonRpcUrl, request).pipe(
      map(response => {
        const result = unwrapKodiResult(response);

        return {
        albums: AlbumFactory.fromKodiResponseList(result.albums || []),
        total: result.limits.total,
        start: result.limits.start,
        end: result.limits.end
        };
      })
    );
  }

  getAlbumById(albumId: number): Observable<Album> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: 'AudioLibrary.GetAlbumDetails',
      params: {
        albumid: albumId,
        properties: ALBUM_DETAIL_PROPERTIES
      },
      id: this.getNextId()
    };

    return this.http.post<KodiAlbumDetailResponse>(this.config.jsonRpcUrl, request).pipe(
      map(response => {
        return AlbumFactory.fromKodiResponse(unwrapKodiResult(response).albumdetails);
      })
    );
  }

  getAlbumTracks(albumId: number): Observable<Track[]> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: 'AudioLibrary.GetSongs',
      params: {
        filter: { albumid: albumId },
        properties: [
          'title', 'artist', 'albumartist', 'genre', 'year', 'rating',
          'album', 'track', 'duration', 'playcount', 'lastplayed',
          'thumbnail', 'file', 'artistid', 'albumid'
        ],
        sort: { order: 'ascending', method: 'track' }
      },
      id: this.getNextId()
    };

    return this.http.post<KodiTracksResponse>(this.config.jsonRpcUrl, request).pipe(
      map(response =>
        TrackFactory.fromKodiResponseList(unwrapKodiResult(response).songs || [])
      )
    );
  }

  addToPlaylist(albumId: number, playImmediately: boolean): Observable<void> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: playImmediately ? 'Player.Open' : 'Playlist.Add',
      params: playImmediately
        ? { item: { albumid: albumId } }
        : { playlistid: 0, item: { albumid: albumId } },
      id: this.getNextId()
    };

    return this.http.post<KodiEnvelope<unknown>>(this.config.jsonRpcUrl, request).pipe(
      map(response => {
        // Un rechazo llega con HTTP 200: sin mirarlo pasaba por buena.
        assertKodiOk(response);
        return void 0;
      })
    );
  }

  updateAlbum(albumId: number, patch: AlbumUpdate): Observable<void> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: Methods.AudioLibrarySetAlbumDetails,
      params: {
        albumid: albumId,
        ...this.toKodiParams(patch)
      },
      id: this.getNextId()
    };

    return this.http.post<KodiJsonRpcEnvelope>(this.config.jsonRpcUrl, request).pipe(
      map(response => {
        if (response.error) {
          throw new Error(
            `Kodi rechazo la actualizacion: ${response.error.message} (codigo ${response.error.code})`
          );
        }
        return void 0;
      })
    );
  }

  /**
   * Solo viajan los campos presentes en el patch. `undefined` significa "no
   * tocar" y se descarta; `null` si viaja, porque en las listas y en el artwork
   * es como se borra un valor.
   */
  private toKodiParams(patch: AlbumUpdate): Record<string, unknown> {
    const params: Record<string, unknown> = {};

    for (const [field, value] of Object.entries(patch)) {
      if (value === undefined) {
        continue;
      }

      const name = UPDATE_PARAM_NAMES[field as keyof AlbumUpdate];
      if (name) {
        params[name] = value;
      }
    }

    return params;
  }

  private buildAlbumsRequest(params: AlbumSearchParams): KodiJsonRpcRequest {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: 'AudioLibrary.GetAlbums',
      params: {
        limits: {
          start: params.start,
          end: params.end
        },
        properties: ALBUM_LIST_PROPERTIES,
        sort: { order: 'ascending', method: 'album' }
      },
      id: this.getNextId()
    };

    if (params.searchTerm) {
      (request.params as Record<string, unknown>)['filter'] = {
        field: params.field || 'album',
        operator: params.operator || 'contains',
        value: params.searchTerm
      };
    }

    return request;
  }

  private getNextId(): number {
    return this.requestId++;
  }
}
