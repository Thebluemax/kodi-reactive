// ==========================================================================
// APPLICATION USE CASE - Delete Saved Playlist
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { PlaylistStorageService } from '../../infrastructure/services/playlist-storage.service';

@Injectable({
  providedIn: 'root'
})
export class DeleteSavedPlaylistUseCase {
  private readonly storageService = inject(PlaylistStorageService);

  /**
   * Delete a saved playlist from localStorage
   * @param playlistId - ID of the playlist to delete
   * @returns true if deleted, false if not found
   */
  execute(playlistId: string): boolean {
    return this.storageService.deletePlaylist(playlistId);
  }
}
