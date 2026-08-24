// ==========================================================================
// INFRASTRUCTURE - Track Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TrackRepository } from '../../domain/repositories/track.repository';
import { TrackUpdate } from '../../domain/entities/track.entity';
import { KodiRpcService } from '@shared/services/kodi-rpc.service';
import { Methods } from '@shared/enums/methods';

/** Kodi devuelve los rechazos con HTTP 200 y el fallo dentro del sobre. */
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
  private readonly rpc = inject(KodiRpcService);

  addToPlaylist(trackId: number, playImmediately: boolean): Observable<void> {
    return playImmediately
      ? this.rpc.command(Methods.PlayerOpen, { item: { songid: trackId } })
      : this.rpc.command(Methods.PlaylistAdd, {
          playlistid: 0,
          item: { songid: trackId }
        });
  }

  playTrack(trackId: number): Observable<void> {
    return this.rpc.command(Methods.PlayerOpen, { item: { songid: trackId } });
  }

  updateSong(songId: number, patch: TrackUpdate): Observable<void> {
    return this.rpc.command(Methods.AudioLibrarySetSongDetails, {
      songid: songId,
      ...this.toKodiParams(patch)
    });
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
