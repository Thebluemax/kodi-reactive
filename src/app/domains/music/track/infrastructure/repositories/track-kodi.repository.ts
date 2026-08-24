// ==========================================================================
// INFRASTRUCTURE - Track Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { TrackRepository } from '../../domain/repositories/track.repository';
import { TrackUpdate } from '../../domain/entities/track.entity';
import { KodiConfigService } from '@shared/services/kodi-config.service';
import { Methods } from '@shared/enums/methods';
import { KodiEnvelope, assertKodiOk } from '@shared/utils/kodi-envelope';

interface KodiJsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, unknown>;
  id: number;
}

/** Kodi devuelve los rechazos con HTTP 200 y el fallo dentro del sobre. */
interface KodiJsonRpcEnvelope {
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
}

/** Traduccion del vocabulario del dominio al de AudioLibrary.SetSongDetails. */
const UPDATE_PARAM_NAMES: Record<keyof TrackUpdate, string> = {
  title: 'title',
  artists: 'artist',
  genres: 'genre',
  year: 'year',
  rating: 'rating',
  userRating: 'userrating',
  votes: 'votes',
  trackNumber: 'track',
  disc: 'disc',
  discTitle: 'disctitle',
  duration: 'duration',
  comment: 'comment',
  mood: 'mood',
  displayArtist: 'displayartist',
  sortArtist: 'sortartist',
  musicBrainzTrackId: 'musicbrainztrackid',
  musicBrainzArtistId: 'musicbrainzartistid',
  releaseDate: 'releasedate',
  originalDate: 'originaldate',
  bpm: 'bpm',
  art: 'art'
};

@Injectable({
  providedIn: 'root'
})
export class TrackKodiRepository extends TrackRepository {
  private readonly http = inject(HttpClient);
  private readonly config = inject(KodiConfigService);
  private requestId = 1;

  addToPlaylist(trackId: number, playImmediately: boolean): Observable<void> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: '2.0',
      method: playImmediately ? 'Player.Open' : 'Playlist.Add',
      params: playImmediately
        ? { item: { songid: trackId } }
        : { playlistid: 0, item: { songid: trackId } },
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

  playTrack(trackId: number): Observable<void> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: '2.0',
      method: 'Player.Open',
      params: { item: { songid: trackId } },
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

  private getNextId(): number {
    return this.requestId++;
  }

  updateSong(songId: number, patch: TrackUpdate): Observable<void> {
    const request: KodiJsonRpcRequest = {
      jsonrpc: '2.0',
      method: Methods.AudioLibrarySetSongDetails,
      params: {
        songid: songId,
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

  /** Solo viajan los campos presentes; `null` si viaja, porque borra el valor. */
  private toKodiParams(patch: TrackUpdate): Record<string, unknown> {
    const params: Record<string, unknown> = {};

    for (const [field, value] of Object.entries(patch)) {
      if (value === undefined) {
        continue;
      }

      const name = UPDATE_PARAM_NAMES[field as keyof TrackUpdate];
      if (name) {
        params[name] = value;
      }
    }

    return params;
  }
}
