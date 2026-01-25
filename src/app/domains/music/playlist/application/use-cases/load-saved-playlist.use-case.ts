// ==========================================================================
// APPLICATION USE CASE - Load Saved Playlist to Kodi
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable, concat, of } from 'rxjs';
import { last, switchMap } from 'rxjs/operators';
import { PlaylistStorageService } from '../../infrastructure/services/playlist-storage.service';
import { PlaylistRepository } from '../../domain/repositories/playlist.repository';

@Injectable({
  providedIn: 'root'
})
export class LoadSavedPlaylistUseCase {
  private readonly storageService = inject(PlaylistStorageService);
  private readonly playlistRepository = inject(PlaylistRepository);

  /**
   * Load a saved playlist into Kodi
   * Clears the current playlist first, then adds all items
   * @param savedPlaylistId - ID of the saved playlist to load
   * @param playlistId - Kodi playlist ID (0 = audio, 1 = video)
   */
  execute(savedPlaylistId: string, playlistId: number = 0): Observable<void> {
    const savedPlaylist = this.storageService.getPlaylistById(savedPlaylistId);

    if (!savedPlaylist) {
      throw new Error(`Playlist with ID ${savedPlaylistId} not found`);
    }

    // Clear playlist first, then add all items
    return this.playlistRepository.clearPlaylist(playlistId).pipe(
      switchMap(() => {
        if (savedPlaylist.items.length === 0) {
          return of(void 0);
        }

        // Add all items sequentially
        const addOperations = savedPlaylist.items.map(item =>
          this.playlistRepository.addItem(item.id, playlistId)
        );

        return concat(...addOperations).pipe(last());
      })
    );
  }
}
