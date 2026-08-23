// ==========================================================================
// PRESENTATION - Current Play List Component
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
import { AssetsPipe } from '@shared/pipes/assets.pipe';
import { PlaylistItem } from '../../../domain/entities/playlist-item.entity';
import { ClearPlaylistUseCase } from '../../../application/use-cases/clear-playlist.use-case';
import { RemovePlaylistItemUseCase } from '../../../application/use-cases/remove-playlist-item.use-case';
import { ReorderPlaylistUseCase } from '../../../application/use-cases/reorder-playlist.use-case';
import { PlayPlaylistItemUseCase } from '../../../application/use-cases/play-playlist-item.use-case';
import { SavePlaylistUseCase } from '../../../application/use-cases/save-playlist.use-case';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { NotificationService } from '@shared/services/notification.service';

@Component({
  selector: 'app-current-play-list',
  standalone: true,
  imports: [
    EmptyStateComponent,
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
  templateUrl: './current-play-list.component.html',
  styleUrl: './current-play-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrentPlayListComponent {
  private readonly alertController = inject(AlertController);
  private readonly notifications = inject(NotificationService);
  private readonly clearPlaylistUseCase = inject(ClearPlaylistUseCase);
  private readonly removePlaylistItemUseCase = inject(RemovePlaylistItemUseCase);
  private readonly reorderPlaylistUseCase = inject(ReorderPlaylistUseCase);
  private readonly playPlaylistItemUseCase = inject(PlayPlaylistItemUseCase);
  private readonly savePlaylistUseCase = inject(SavePlaylistUseCase);

  // Inputs using signals
  readonly playlist = input<PlaylistItem[]>([]);
  readonly currentTrackPosition = input<number | null | undefined>(null);
  readonly playlistId = input<number>(0);

  // Output using output()
  readonly playlistChanged = output<void>();

  // Local state
  readonly reorderEnabled = signal<boolean>(false);

  clearList(): void {
    this.clearPlaylistUseCase.execute(this.playlistId()).subscribe({
      next: () => {
        this.playlistChanged.emit();
      },
      error: (err) => console.error('Failed to clear playlist:', err)
    });
  }

  playItem(position: number): void {
    this.playPlaylistItemUseCase.execute(position, this.playlistId()).subscribe({
      error: (err) => console.error('Failed to play item:', err)
    });
  }

  removeItem(position: number, event: Event): void {
    event.stopPropagation();
    this.removePlaylistItemUseCase.execute(position, this.playlistId()).subscribe({
      next: () => {
        this.playlistChanged.emit();
      },
      error: (err) => console.error('Failed to remove item:', err)
    });
  }

  onReorder(event: CustomEvent<ItemReorderEventDetail>): void {
    const fromPosition = event.detail.from;
    const toPosition = event.detail.to;

    event.detail.complete();

    this.reorderPlaylistUseCase.execute(fromPosition, toPosition, this.playlistId()).subscribe({
      next: () => {
        this.playlistChanged.emit();
      },
      error: (err) => {
        console.error('Failed to reorder playlist:', err);
        this.playlistChanged.emit();
      }
    });
  }

  toggleReorder(): void {
    this.reorderEnabled.update(v => !v);
  }

  async savePlaylist(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Guardar Playlist',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre de la playlist'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.name && data.name.trim()) {
              this.savePlaylistUseCase.execute(data.name.trim(), this.playlist());
              this.showSaveToast(data.name.trim());
            }
          }
        }
      ]
    });
    await alert.present();
  }

  private showSaveToast(name: string): Promise<void> {
    return this.notifications.success(`Playlist "${name}" guardada`);
  }
}
