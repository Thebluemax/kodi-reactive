// ==========================================================================
// DOMAIN REPOSITORY - TVShow (Interface/Contract)
// ==========================================================================

import { Observable } from 'rxjs';
import { MediaRefreshOptions } from '@shared/types/media-refresh.type';
import {
  TVShow,
  TVShowListResult,
  TVShowSearchParams,
  Season,
  Episode, TVShowUpdate } from '../entities/tvshow.entity';

/**
 * TVShow Repository Interface
 * Defines the contract for TV show data access
 * Implementations can be Kodi API, Mock, LocalStorage, etc.
 */
export abstract class TVShowRepository {
  /**
   * Get paginated list of TV shows
   */
  abstract getTVShows(params: TVShowSearchParams): Observable<TVShowListResult>;

  /**
   * Get single TV show by ID with full details
   */
  abstract getTVShowById(tvshowId: number): Observable<TVShow>;

  /**
   * Get seasons for a TV show
   */
  abstract getSeasons(tvshowId: number): Observable<Season[]>;

  /**
   * Get episodes for a TV show season
   */
  abstract getEpisodes(tvshowId: number, season: number): Observable<Episode[]>;

  /**
   * Add episode to playlist or play immediately
   * @param episodeId - Episode ID
   * @param playImmediately - If true, starts playing immediately
   */
  abstract addEpisodeToPlaylist(episodeId: number, playImmediately: boolean): Observable<void>;

  /**
   * Update a TV show with a partial patch
   * @param tvshowId - TV show ID
   * @param patch - Only the fields to change; anything absent is left untouched
   */
  abstract updateTVShow(tvshowId: number, patch: TVShowUpdate): Observable<void>;

  /**
   * Ask Kodi to scrape the TV show again
   * @param tvshowId - TV show ID
   * @param options - Title, whether to ignore a local NFO, and whether to
   *                  cascade the refresh to every episode
   */
  abstract refreshTVShow(tvshowId: number, options: MediaRefreshOptions): Observable<void>;
}
