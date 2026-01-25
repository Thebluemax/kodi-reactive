// ==========================================================================
// APPLICATION USE CASE - Reorder Playlist
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { Observable, concat, of } from 'rxjs';
import { last } from 'rxjs/operators';
import { PlaylistRepository } from '../../domain/repositories/playlist.repository';

@Injectable({
  providedIn: 'root'
})
export class ReorderPlaylistUseCase {
  private readonly playlistRepository = inject(PlaylistRepository);

  /**
   * Reorder playlist by moving item from one position to another
   * Uses multiple swap operations since Kodi only supports swapping adjacent items
   * @param fromPosition - Original position of item
   * @param toPosition - Target position to move item to
   * @param playlistId - Playlist ID (0 = audio, 1 = video)
   */
  execute(fromPosition: number, toPosition: number, playlistId: number = 0): Observable<void> {
    if (fromPosition === toPosition) {
      return of(void 0);
    }

    // Calculate the swap sequence needed
    const swaps: Array<[number, number]> = [];

    if (fromPosition < toPosition) {
      // Moving down: swap with next item repeatedly
      for (let i = fromPosition; i < toPosition; i++) {
        swaps.push([i, i + 1]);
      }
    } else {
      // Moving up: swap with previous item repeatedly
      for (let i = fromPosition; i > toPosition; i--) {
        swaps.push([i, i - 1]);
      }
    }

    // Execute all swaps sequentially
    const swapOperations = swaps.map(([pos1, pos2]) =>
      this.playlistRepository.swapItems(pos1, pos2, playlistId)
    );

    return concat(...swapOperations).pipe(last());
  }
}
