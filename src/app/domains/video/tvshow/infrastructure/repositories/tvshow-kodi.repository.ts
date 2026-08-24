// ==========================================================================
// INFRASTRUCTURE - TVShow Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
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
import { KodiRpcService } from '@shared/services/kodi-rpc.service';
import { Methods } from '@shared/enums/methods';
import { MediaRefreshOptions } from '@shared/types/media-refresh.type';

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

/**
 * Los parametros del refresco son opcionales en la API y tienen sus propios
 * valores por defecto: sin `title` Kodi lo deduce del archivo, y `ignorenfo` y
 * `refreshepisodes` son false. Solo viaja lo que se indica.
 */
function toRefreshParams(options: MediaRefreshOptions): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  const title = options.title?.trim() ?? '';

  if (title.length > 0) {
    params['title'] = title;
  }

  if (options.ignoreNfo) {
    params['ignorenfo'] = true;
  }

  if (options.refreshEpisodes) {
    params['refreshepisodes'] = true;
  }

  return params;
}

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
  private readonly rpc = inject(KodiRpcService);

  getTVShows(params: TVShowSearchParams): Observable<TVShowListResult> {
    return this.rpc
      .query<KodiTVShowsResponse['result']>(
        Methods.VideoLibraryGetTVShows,
        this.buildTVShowsParams(params)
      )
      .pipe(
      map(result => {
        return {
        tvshows: TVShowFactory.fromKodiResponseList(result.tvshows || []),
        total: result.limits.total,
        start: result.limits.start,
        end: result.limits.end
        };
      })
    );
  }

  getTVShowById(tvshowId: number): Observable<TVShow> {
    return this.rpc.query<KodiTVShowDetailResponse['result']>('VideoLibrary.GetTVShowDetails', {
      tvshowid: tvshowId,
      properties: TVSHOW_DETAIL_PROPERTIES
    }).pipe(
      map(result =>
        TVShowFactory.fromKodiResponse(result.tvshowdetails)
      )
    );
  }

  getSeasons(tvshowId: number): Observable<Season[]> {
    return this.rpc.query<KodiSeasonsResponse['result']>('VideoLibrary.GetSeasons', {
      tvshowid: tvshowId,
      properties: SEASON_PROPERTIES,
      sort: { order: 'ascending', method: 'season' }
    }).pipe(
      map(result =>
        SeasonFactory.fromKodiResponseList(result.seasons || [])
      )
    );
  }

  getEpisodes(tvshowId: number, season: number): Observable<Episode[]> {
    return this.rpc.query<KodiEpisodesResponse['result']>('VideoLibrary.GetEpisodes', {
      tvshowid: tvshowId,
      season: season,
      properties: EPISODE_PROPERTIES,
      sort: { order: 'ascending', method: 'episode' }
    }).pipe(
      map(result =>
        EpisodeFactory.fromKodiResponseList(result.episodes || [])
      )
    );
  }

  addEpisodeToPlaylist(episodeId: number, playImmediately: boolean): Observable<void> {
    return playImmediately
      ? this.rpc.command(Methods.PlayerOpen, { item: { episodeid: episodeId } })
      : this.rpc.command(Methods.PlaylistAdd, {
          playlistid: 1,
          item: { episodeid: episodeId }
        });
  }

  private buildTVShowsParams(params: TVShowSearchParams): Record<string, unknown> {
    const query: Record<string, unknown> = {
      limits: {
        start: params.start,
        end: params.end
      },
      properties: TVSHOW_LIST_PROPERTIES,
      sort: { order: 'ascending', method: 'title' }
    };

    if (params.searchTerm) {
      query['filter'] = {
        field: params.field || 'title',
        operator: params.operator || 'contains',
        value: params.searchTerm
      };
    }

    return query;
  }

  updateTVShow(tvshowId: number, patch: TVShowUpdate): Observable<void> {
    return this.rpc.command(Methods.VideoLibrarySetTVShowDetails, {
      tvshowid: tvshowId,
      ...this.toKodiParams(patch)
    });
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
    return this.rpc.command(Methods.VideoLibraryRefreshTVShow, {
      tvshowid: tvshowId,
      ...toRefreshParams(options)
    });
  }
}
