// ==========================================================================
// PRESENTATION - Saved Playlist Detail Component
// ==========================================================================

import { Component, ChangeDetectionStrategy, input, output, signal, inject } from '@angular/core';
import {
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonList,
  IonReorderGroup,
  IonItem,
  IonAvatar,
  IonLabel,
  IonReorder,
  IonText,
  AlertController,
  ItemReorderEventDetail
} from '@ionic/angular/standalone';
import { switchMap } from 'rxjs/operators';
import { AssetsPipe } from '@shared/pipes/assets.pipe';
import { PlaylistItem, SavedPlaylist } from '../../../domain/entities/playlist-item.entity';
import { UpdateSavedPlaylistUseCase } from '../../../application/use-cases/update-saved-playlist.use-case';
import { DeleteSavedPlaylistUseCase } from '../../../application/use-cases/delete-saved-playlist.use-case';
import { LoadSavedPlaylistUseCase } from '../../../application/use-cases/load-saved-playlist.use-case';
import { PlayPlaylistItemUseCase } from '../../../application/use-cases/play-playlist-item.use-case';

@Component({
  selector: 'app-saved-playlist-detail',
  standalone: true,
  imports: [
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonTitle,
    IonList,
    IonReorderGroup,
    IonItem,
    IonAvatar,
    IonLabel,
    IonReorder,
    IonText,
    AssetsPipe
  ],
  templateUrl: './saved-playlist-detail.component.html',
  styleUrl: './saved-playlist-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SavedPlaylistDetailComponent {
  private readonly alertController = inject(AlertController);
  private readonly updateUseCase = inject(UpdateSavedPlaylistUseCase);
  private readonly deleteUseCase = inject(DeleteSavedPlaylistUseCase);
  private readonly loadUseCase = inject(LoadSavedPlaylistUseCase);
  private readonly playItemUseCase = inject(PlayPlaylistItemUseCase);

  // Inputs
  readonly playlist = input.required<SavedPlaylist>();

  // Outputs
  readonly playlistUpdated = output<SavedPlaylist>();
  readonly playlistDeleted = output<string>();

  // Local state
  readonly reorderEnabled = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);

  toggleReorder(): void {
    this.reorderEnabled.update(v => !v);
  }

  onReorder(event: CustomEvent<ItemReorderEventDetail>): void {
    const items = [...this.playlist().items];
    const movedItem = items.splice(event.detail.from, 1)[0];
    items.splice(event.detail.to, 0, movedItem);
    event.detail.complete();

    const updated = this.updateUseCase.execute(this.playlist().id, undefined, items);
    if (updated) {
      this.playlistUpdated.emit(updated);
    }
  }

  removeTrack(index: number, event: Event): void {
    event.stopPropagation();
    const items = this.playlist().items.filter((_, i) => i !== index);
    const updated = this.updateUseCase.execute(this.playlist().id, undefined, items);
    if (updated) {
      this.playlistUpdated.emit(updated);
    }
  }

  async renamePlaylist(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Renombrar Playlist',
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: this.playlist().name,
          placeholder: 'Nombre de la playlist'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.name?.trim()) {
              const updated = this.updateUseCase.execute(this.playlist().id, data.name.trim());
              if (updated) {
                this.playlistUpdated.emit(updated);
              }
            }
          }
        }
      ]
    });
    await alert.present();
  }

  playPlaylist(): void {
    this.isLoading.set(true);
    this.loadUseCase.execute(this.playlist().id).pipe(
      switchMap(() => this.playItemUseCase.execute(0))
    ).subscribe({
      next: () => this.isLoading.set(false),
      error: (err) => {
        console.error('Failed to play playlist:', err);
        this.isLoading.set(false);
      }
    });
  }

  async deletePlaylist(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Eliminar Playlist',
      message: `¿Eliminar "${this.playlist().name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.deleteUseCase.execute(this.playlist().id);
            this.playlistDeleted.emit(this.playlist().id);
          }
        }
      ]
    });
    await alert.present();
  }
}
