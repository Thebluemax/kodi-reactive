// ==========================================================================
// INFRASTRUCTURE - Playlist Kodi Repository Implementation
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PlaylistRepository } from '../../domain/repositories/playlist.repository';
import { PlaylistItem, PlaylistItemFactory, PlaylistResult, KodiPlaylistItemResponse } from '../../domain/entities/playlist-item.entity';
import { KodiRpcService } from '@shared/services/kodi-rpc.service';
import { Methods } from '@shared/enums/methods';

interface KodiPlaylistResponse {
  limits: {
    end: number;
    start: number;
    total: number;
  };
  items?: KodiPlaylistItemResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class PlaylistKodiRepository extends PlaylistRepository {
  private readonly rpc = inject(KodiRpcService);

  getPlaylist(playlistId: number = 0): Observable<PlaylistResult> {
    return this.rpc
      .query<KodiPlaylistResponse>(Methods.PlaylistGetItems, {
        playlistid: playlistId,
        properties: [
          'title', 'artist', 'album', 'duration',
          'track', 'year', 'thumbnail', 'fanart', 'file'
        ]
      })
      .pipe(
        map(result => ({
          // Una cola vacia es legitima: Kodi omite `items` en ese caso.
          items: PlaylistItemFactory.fromKodiResponseList(result.items || []),
          total: result.limits?.total || 0
        }))
      );
  }

  clearPlaylist(playlistId: number = 0): Observable<void> {
    return this.rpc.command(Methods.PlaylistClear, {
      playlistid: playlistId
    });
  }

  removeItem(position: number, playlistId: number = 0): Observable<void> {
    return this.rpc.command(Methods.PlaylistRemove, {
      playlistid: playlistId,
      position
    });
  }

  swapItems(position1: number, position2: number, playlistId: number = 0): Observable<void> {
    return this.rpc.command(Methods.PlaylistSwap, {
      playlistid: playlistId,
      position1,
      position2
    });
  }

  playItem(position: number, playlistId: number = 0): Observable<void> {
    return this.rpc.command(Methods.PlayerOpen, {
      item: {
        playlistid: playlistId,
        position
      }
    });
  }

  addItem(songId: number, playlistId: number = 0): Observable<void> {
    return this.rpc.command(Methods.PlaylistAdd, {
      playlistid: playlistId,
      item: {
        songid: songId
      }
    });
  }

}
