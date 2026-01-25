// ==========================================================================
// APPLICATION USE CASE - Save Playlist to localStorage
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { PlaylistStorageService } from '../../infrastructure/services/playlist-storage.service';
import { PlaylistItem, SavedPlaylist } from '../../domain/entities/playlist-item.entity';

@Injectable({
  providedIn: 'root'
})
export class SavePlaylistUseCase {
  private readonly storageService = inject(PlaylistStorageService);

  /**
   * Save current playlist to localStorage
   * @param name - Name for the saved playlist
   * @param items - Playlist items to save
   */
  execute(name: string, items: PlaylistItem[]): SavedPlaylist {
    return this.storageService.savePlaylist(name, items);
  }
}
