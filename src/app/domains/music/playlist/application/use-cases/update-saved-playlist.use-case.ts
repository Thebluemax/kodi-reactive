// ==========================================================================
// APPLICATION USE CASE - Update Saved Playlist
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { PlaylistStorageService } from '../../infrastructure/services/playlist-storage.service';
import { PlaylistItem, SavedPlaylist } from '../../domain/entities/playlist-item.entity';

@Injectable({
  providedIn: 'root'
})
export class UpdateSavedPlaylistUseCase {
  private readonly storageService = inject(PlaylistStorageService);

  /**
   * Update a saved playlist in localStorage
   * @param playlistId - ID of the playlist to update
   * @param name - New name (optional)
   * @param items - New items (optional)
   * @returns Updated playlist or null if not found
   */
  execute(playlistId: string, name?: string, items?: PlaylistItem[]): SavedPlaylist | null {
    return this.storageService.updatePlaylist(playlistId, name, items);
  }
}
