// ==========================================================================
// INFRASTRUCTURE - TVShow Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TVShowRepository } from '../../domain/repositories/tvshow.repository';
import {
  TVShow,
  TVShowListResult,
  TVShowSearchParams,
  TVShowFactory,
  Season,
  SeasonFactory,
  Episode,
  EpisodeFactory,
  KodiTVShowResponse,
  KodiSeasonResponse,
  KodiEpisodeResponse, TVShowUpdate } from '../../domain/entities/tvshow.entity';
import { environment } from 'src/environments/environment';
import { KodiConfigService } from '@shared/services/kodi-config.service';
import { Methods } from '@shared/enums/methods';
import { MediaRefreshOptions } from '@shared/types/media-refresh.type';

interface KodiJsonRpcRequest {
  jsonrpc: string;
  method: string;
  params?: Record<string, unknown>;
  id: number;
}

interface KodiTVShowsResponse {
  result: {
    tvshows: KodiTVShowResponse[];
    limits: {
      start: number;
      end: number;
      total: number;
    };
  };
}

interface KodiTVShowDetailResponse {
  result: {
    tvshowdetails: KodiTVShowResponse;
  };
}

interface KodiSeasonsResponse {
  result: {
    seasons: KodiSeasonResponse[];
  };
}

interface KodiEpisodesResponse {
  result: {
    episodes: KodiEpisodeResponse[];
  };
}

/** Kodi devuelve los rechazos con HTTP 200 y el fallo dentro del sobre. */
interface KodiJsonRpcEnvelope {
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
}

/** Traduccion del vocabulario del dominio al de VideoLibrary.SetTVShowDetails. */
const UPDATE_PARAM_NAMES: Record<keyof TVShowUpdate, string> = {
  title: 'title',
  originalTitle: 'originaltitle',
  sortTitle: 'sorttitle',
  plot: 'plot',
  genre: 'genre',
  studio: 'studio',
  tag: 'tag',
  premiered: 'premiered',
  runtime: 'runtime',
  rating: 'rating',
  userRating: 'userrating',
  votes: 'votes',
  mpaa: 'mpaa',
  imdbNumber: 'imdbnumber',
  episodeGuide: 'episodeguide',
  status: 'status',
  art: 'art'
};

/** El detalle alimenta el editor: pide todo lo que SetTVShowDetails escribe. */
const TVSHOW_DETAIL_PROPERTIES = [
  'title', 'originaltitle', 'sorttitle', 'genre', 'year', 'premiered',
  'rating', 'userrating', 'votes', 'plot', 'studio', 'tag', 'mpaa',
  'imdbnumber', 'episodeguide', 'status', 'runtime', 'cast',
  'thumbnail', 'fanart', 'art', 'season', 'episode', 'playcount', 'dateadded',
  'file'
];

/**
 * La lista pagina y sus tarjetas solo pintan titulo, generos, fanart y año.
 * Al abrir el detalle la serie se recarga entera de todas formas.
 */
const TVSHOW_LIST_PROPERTIES = [
  'title', 'genre', 'fanart', 'year'
];

const SEASON_PROPERTIES = [
  'season', 'episode', 'watchedepisodes', 'playcount', 'thumbnail'
];

const EPISODE_PROPERTIES = [
  'title', 'plot', 'runtime', 'season', 'episode',
  'file', 'thumbnail', 'playcount', 'dateadded',
  'firstaired', 'rating'
];

@Injectable({
  providedIn: 'root'
})
export class TVShowKodiRepository extends TVShowRepository {
  private readonly http = inject(HttpClient);
  private readonly config = inject(KodiConfigService);
  private requestId = 1;

  getTVShows(params: TVShowSearchParams): Observable<TVShowListResult> {
    const request = this.buildTVShowsRequest(params);

    return this.http.post<KodiTVShowsResponse>(this.config.jsonRpcUrl, request).pipe(
      map(response => ({
        tvshows: TVShowFactory.fromKodiResponseList(response.result.tvshows || []),
        total: response.result.limits.total,
        start: response.result.limits.start,
        end: response.result.limits.end
      }))
    );
  }

  getTVShowById(tvshowId: number): Observable<TVShow> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: 'VideoLibrary.GetTVShowDetails',
      params: {
        tvshowid: tvshowId,
        properties: TVSHOW_DETAIL_PROPERTIES
      },
      id: this.getNextId()
    };

    return this.http.post<KodiTVShowDetailResponse>(this.config.jsonRpcUrl, request).pipe(
      map(response => {
        if ((response as any).error) {
          throw new Error((response as any).error.message || 'Unknown Kodi error');
        }
        return TVShowFactory.fromKodiResponse(response.result.tvshowdetails);
      })
    );
  }

  getSeasons(tvshowId: number): Observable<Season[]> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: 'VideoLibrary.GetSeasons',
      params: {
        tvshowid: tvshowId,
        properties: SEASON_PROPERTIES,
        sort: { order: 'ascending', method: 'season' }
      },
      id: this.getNextId()
    };

    return this.http.post<KodiSeasonsResponse>(this.config.jsonRpcUrl, request).pipe(
      map(response => SeasonFactory.fromKodiResponseList(response.result.seasons || []))
    );
  }

  getEpisodes(tvshowId: number, season: number): Observable<Episode[]> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: 'VideoLibrary.GetEpisodes',
      params: {
        tvshowid: tvshowId,
        season: season,
        properties: EPISODE_PROPERTIES,
        sort: { order: 'ascending', method: 'episode' }
      },
      id: this.getNextId()
    };

    return this.http.post<KodiEpisodesResponse>(this.config.jsonRpcUrl, request).pipe(
      map(response => EpisodeFactory.fromKodiResponseList(response.result.episodes || []))
    );
  }

  addEpisodeToPlaylist(episodeId: number, playImmediately: boolean): Observable<void> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: playImmediately ? 'Player.Open' : 'Playlist.Add',
      params: playImmediately
        ? { item: { episodeid: episodeId } }
        : { playlistid: 1, item: { episodeid: episodeId } },
      id: this.getNextId()
    };

    return this.http.post<unknown>(this.config.jsonRpcUrl, request).pipe(
      map(() => void 0)
    );
  }

  private buildTVShowsRequest(params: TVShowSearchParams): KodiJsonRpcRequest {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: 'VideoLibrary.GetTVShows',
      params: {
        limits: {
          start: params.start,
          end: params.end
        },
        properties: TVSHOW_LIST_PROPERTIES,
        sort: { order: 'ascending', method: 'title' }
      },
      id: this.getNextId()
    };

    if (params.searchTerm) {
      (request.params as Record<string, unknown>)['filter'] = {
        field: params.field || 'title',
        operator: params.operator || 'contains',
        value: params.searchTerm
      };
    }

    return request;
  }

  private getNextId(): number {
    return this.requestId++;
  }

  updateTVShow(tvshowId: number, patch: TVShowUpdate): Observable<void> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: Methods.VideoLibrarySetTVShowDetails,
      params: {
        tvshowid: tvshowId,
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
   * Solo viajan los campos presentes. `undefined` significa "no tocar" y se
   * descarta; `null` si viaja, porque en las listas y el artwork borra el valor.
   */
  private toKodiParams(patch: TVShowUpdate): Record<string, unknown> {
    const params: Record<string, unknown> = {};

    for (const [field, value] of Object.entries(patch)) {
      if (value === undefined) {
        continue;
      }

      const name = UPDATE_PARAM_NAMES[field as keyof TVShowUpdate];
      if (name) {
        params[name] = value;
      }
    }

    return params;
  }

  refreshTVShow(tvshowId: number, options: MediaRefreshOptions): Observable<void> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: environment.jsonrpcVersion,
      method: Methods.VideoLibraryRefreshTVShow,
      params: {
        tvshowid: tvshowId,
        ignorenfo: options.ignoreNfo ?? false,
        refreshepisodes: options.refreshEpisodes ?? false,
        title: options.title?.trim() ?? ''
      },
      id: this.getNextId()
    };

    return this.http.post<KodiJsonRpcEnvelope>(this.config.jsonRpcUrl, request).pipe(
      map(response => {
        if (response.error) {
          throw new Error(
            `Kodi no ha podido volver a buscar los datos: ${response.error.message} (codigo ${response.error.code})`
          );
        }
        return void 0;
      })
    );
  }
}
