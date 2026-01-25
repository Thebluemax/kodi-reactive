// ==========================================================================
// INFRASTRUCTURE SERVICE - Playlist Storage (localStorage)
// ==========================================================================

import { Injectable } from '@angular/core';
import { SavedPlaylist, PlaylistItem, PlaylistItemFactory } from '../../domain/entities/playlist-item.entity';

const STORAGE_KEY = 'kodi_saved_playlists';

@Injectable({
  providedIn: 'root'
})
export class PlaylistStorageService {
  /**
   * Save a playlist to localStorage
   * @param name - Name of the playlist
   * @param items - Playlist items to save
   * @returns The saved playlist with generated ID
   */
  savePlaylist(name: string, items: PlaylistItem[]): SavedPlaylist {
    const playlists = this.getAllPlaylists();
    const newPlaylist = PlaylistItemFactory.toSavedPlaylist(name, items);
    playlists.push(newPlaylist);
    this.persistPlaylists(playlists);
    return newPlaylist;
  }

  /**
   * Get all saved playlists
   */
  getAllPlaylists(): SavedPlaylist[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get a specific saved playlist by ID
   * @param playlistId - ID of the playlist to retrieve
   */
  getPlaylistById(playlistId: string): SavedPlaylist | null {
    const playlists = this.getAllPlaylists();
    return playlists.find(p => p.id === playlistId) || null;
  }

  /**
   * Delete a saved playlist
   * @param playlistId - ID of the playlist to delete
   * @returns true if deleted, false if not found
   */
  deletePlaylist(playlistId: string): boolean {
    const playlists = this.getAllPlaylists();
    const index = playlists.findIndex(p => p.id === playlistId);
    if (index === -1) {
      return false;
    }
    playlists.splice(index, 1);
    this.persistPlaylists(playlists);
    return true;
  }

  /**
   * Update a saved playlist
   * @param playlistId - ID of the playlist to update
   * @param name - New name (optional)
   * @param items - New items (optional)
   */
  updatePlaylist(playlistId: string, name?: string, items?: PlaylistItem[]): SavedPlaylist | null {
    const playlists = this.getAllPlaylists();
    const index = playlists.findIndex(p => p.id === playlistId);
    if (index === -1) {
      return null;
    }

    const updated: SavedPlaylist = {
      ...playlists[index],
      name: name ?? playlists[index].name,
      items: items ?? playlists[index].items,
      updatedAt: new Date().toISOString()
    };

    playlists[index] = updated;
    this.persistPlaylists(playlists);
    return updated;
  }

  private persistPlaylists(playlists: SavedPlaylist[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
  }
}
