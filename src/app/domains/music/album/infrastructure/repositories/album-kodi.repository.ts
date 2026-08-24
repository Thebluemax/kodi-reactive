// ==========================================================================
// INFRASTRUCTURE - Album Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
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
import { KodiRpcService } from '@shared/services/kodi-rpc.service';
import { Methods } from '@shared/enums/methods';

/**
 * Kodi responde a los errores con HTTP 200 y el fallo dentro del sobre, asi que
 * un rechazo no llega como error de red y hay que leerlo del cuerpo.
 */
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
  private readonly rpc = inject(KodiRpcService);

  getAlbums(params: AlbumSearchParams): Observable<AlbumListResult> {
    return this.rpc
      .query<KodiAlbumsResponse['result']>(
        Methods.AudioLibraryGetAlbums,
        this.buildAlbumsParams(params)
      )
      .pipe(
      map(result => {
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
    return this.rpc
      .query<KodiAlbumDetailResponse['result']>(Methods.AudioLibraryGetAlbumDetails, {
        albumid: albumId,
        properties: ALBUM_DETAIL_PROPERTIES
      })
      .pipe(map(result => AlbumFactory.fromKodiResponse(result.albumdetails)));
  }

  getAlbumTracks(albumId: number): Observable<Track[]> {
    return this.rpc
      .query<KodiTracksResponse['result']>(Methods.AudioLibraryGetSongs, {
        filter: { albumid: albumId },
        properties: [
          'title', 'artist', 'albumartist', 'genre', 'year', 'rating',
          'album', 'track', 'duration', 'playcount', 'lastplayed',
          'thumbnail', 'file', 'artistid', 'albumid'
        ],
        sort: { order: 'ascending', method: 'track' }
      })
      .pipe(map(result => TrackFactory.fromKodiResponseList(result.songs || [])));
  }

  addToPlaylist(albumId: number, playImmediately: boolean): Observable<void> {
    return playImmediately
      ? this.rpc.command(Methods.PlayerOpen, { item: { albumid: albumId } })
      : this.rpc.command(Methods.PlaylistAdd, {
          playlistid: 0,
          item: { albumid: albumId }
        });
  }

  updateAlbum(albumId: number, patch: AlbumUpdate): Observable<void> {
    return this.rpc.command(Methods.AudioLibrarySetAlbumDetails, {
      albumid: albumId,
      ...this.toKodiParams(patch)
    });
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

  private buildAlbumsParams(params: AlbumSearchParams): Record<string, unknown> {
    const query: Record<string, unknown> = {
      limits: {
        start: params.start,
        end: params.end
      },
      properties: ALBUM_LIST_PROPERTIES,
      sort: { order: 'ascending', method: 'album' }
    };

    if (params.searchTerm) {
      query['filter'] = {
        field: params.field || 'album',
        operator: params.operator || 'contains',
        value: params.searchTerm
      };
    }

    return query;
  }
}
