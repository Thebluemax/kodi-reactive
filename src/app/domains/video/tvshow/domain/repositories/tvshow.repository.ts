// ==========================================================================
// DOMAIN REPOSITORY - TVShow (Interface/Contract)
// ==========================================================================

import { Observable } from 'rxjs';
import {
  TVShow,
  TVShowListResult,
  TVShowSearchParams,
  Season,
  Episode
} from '../entities/tvshow.entity';

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
}
