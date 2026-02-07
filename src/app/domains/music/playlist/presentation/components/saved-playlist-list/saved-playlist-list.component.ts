// ==========================================================================
// PRESENTATION - Saved Playlist List Component
// ==========================================================================

import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonButtons,
  IonToolbar,
  IonText,
  IonProgressBar,
  AlertController
} from '@ionic/angular/standalone';
import { DatePipe } from '@angular/common';

import { LateralPanelComponent } from '@domains/music/shared';
import { SavedPlaylist } from '../../../domain/entities/playlist-item.entity';
import { switchMap } from 'rxjs/operators';
import { GetSavedPlaylistsUseCase } from '../../../application/use-cases/get-saved-playlists.use-case';
import { DeleteSavedPlaylistUseCase } from '../../../application/use-cases/delete-saved-playlist.use-case';
import { LoadSavedPlaylistUseCase } from '../../../application/use-cases/load-saved-playlist.use-case';
import { PlayPlaylistItemUseCase } from '../../../application/use-cases/play-playlist-item.use-case';
import { UpdateSavedPlaylistUseCase } from '../../../application/use-cases/update-saved-playlist.use-case';
import { SavedPlaylistDetailComponent } from '../saved-playlist-detail/saved-playlist-detail.component';

@Component({
  selector: 'app-saved-playlist-list',
  standalone: true,
  imports: [
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonButtons,
    IonToolbar,
    IonText,
    IonProgressBar,
    DatePipe,
    LateralPanelComponent,
    SavedPlaylistDetailComponent
  ],
  templateUrl: './saved-playlist-list.component.html',
  styleUrl: './saved-playlist-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SavedPlaylistListComponent implements OnInit {
  private readonly getPlaylistsUseCase = inject(GetSavedPlaylistsUseCase);
  private readonly deletePlaylistUseCase = inject(DeleteSavedPlaylistUseCase);
  private readonly loadPlaylistUseCase = inject(LoadSavedPlaylistUseCase);
  private readonly playItemUseCase = inject(PlayPlaylistItemUseCase);
  private readonly updatePlaylistUseCase = inject(UpdateSavedPlaylistUseCase);
  private readonly alertController = inject(AlertController);

  // State
  readonly savedPlaylists = signal<SavedPlaylist[]>([]);
  readonly selectedPlaylist = signal<SavedPlaylist | null>(null);
  readonly isPanelOpen = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadPlaylists();
  }

  loadPlaylists(): void {
    this.savedPlaylists.set(this.getPlaylistsUseCase.execute());
  }

  selectPlaylist(playlist: SavedPlaylist): void {
    this.selectedPlaylist.set(playlist);
    this.isPanelOpen.set(true);
  }

  playPlaylist(playlist: SavedPlaylist, event: Event): void {
    event.stopPropagation();
    this.isLoading.set(true);
    this.loadPlaylistUseCase.execute(playlist.id).pipe(
      switchMap(() => this.playItemUseCase.execute(0))
    ).subscribe({
      next: () => this.isLoading.set(false),
      error: (err) => {
        console.error('Failed to play playlist:', err);
        this.isLoading.set(false);
      }
    });
  }

  async renamePlaylist(playlist: SavedPlaylist, event: Event): Promise<void> {
    event.stopPropagation();
    const alert = await this.alertController.create({
      header: 'Renombrar Playlist',
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: playlist.name,
          placeholder: 'Nombre de la playlist'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.name?.trim()) {
              this.updatePlaylistUseCase.execute(playlist.id, data.name.trim());
              this.loadPlaylists();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async deletePlaylist(playlist: SavedPlaylist, event: Event): Promise<void> {
    event.stopPropagation();
    const alert = await this.alertController.create({
      header: 'Eliminar Playlist',
      message: `¿Eliminar "${playlist.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.deletePlaylistUseCase.execute(playlist.id);
            this.loadPlaylists();
            if (this.selectedPlaylist()?.id === playlist.id) {
              this.onPanelClosed();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  onPlaylistUpdated(updated: SavedPlaylist): void {
    this.selectedPlaylist.set(updated);
    this.loadPlaylists();
  }

  onPlaylistDeleted(_playlistId: string): void {
    this.loadPlaylists();
    this.onPanelClosed();
  }

  onPanelClosed(): void {
    this.isPanelOpen.set(false);
    this.selectedPlaylist.set(null);
  }
}
