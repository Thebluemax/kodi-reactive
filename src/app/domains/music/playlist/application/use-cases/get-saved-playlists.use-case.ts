// ==========================================================================
// APPLICATION USE CASE - Get Saved Playlists
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { PlaylistStorageService } from '../../infrastructure/services/playlist-storage.service';
import { SavedPlaylist } from '../../domain/entities/playlist-item.entity';

@Injectable({
  providedIn: 'root'
})
export class GetSavedPlaylistsUseCase {
  private readonly storageService = inject(PlaylistStorageService);

  /**
   * Get all saved playlists from localStorage
   */
  execute(): SavedPlaylist[] {
    return this.storageService.getAllPlaylists();
  }
}
