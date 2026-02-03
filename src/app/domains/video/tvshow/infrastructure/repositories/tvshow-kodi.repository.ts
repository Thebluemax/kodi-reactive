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
  KodiEpisodeResponse
} from '../../domain/entities/tvshow.entity';
import { environment } from 'src/environments/environment';

// TODO: Move to core/infrastructure/config
const KODI_API_URL = `${environment.serverApiUrl}:${environment.apiPort}/jsonrpc`;

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

const TVSHOW_PROPERTIES = [
  'title', 'genre', 'year', 'rating', 'plot',
  'cast', 'thumbnail', 'fanart', 'season', 'episode',
  'playcount', 'dateadded', 'studio'
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
  private requestId = 1;

  getTVShows(params: TVShowSearchParams): Observable<TVShowListResult> {
    const request = this.buildTVShowsRequest(params);

    return this.http.post<KodiTVShowsResponse>(KODI_API_URL, request).pipe(
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
        properties: TVSHOW_PROPERTIES
      },
      id: this.getNextId()
    };

    return this.http.post<KodiTVShowDetailResponse>(KODI_API_URL, request).pipe(
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

    return this.http.post<KodiSeasonsResponse>(KODI_API_URL, request).pipe(
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

    return this.http.post<KodiEpisodesResponse>(KODI_API_URL, request).pipe(
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

    return this.http.post<unknown>(KODI_API_URL, request).pipe(
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
        properties: TVSHOW_PROPERTIES,
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
}
