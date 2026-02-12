import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonButton, IonIcon } from '@ionic/angular/standalone';
import { AssetsPipe } from '@shared/pipes/assets.pipe';

export interface MediaTileAction {
  media: unknown;
  playMedia: boolean;
}

@Component({
  selector: 'app-media-tile',
  standalone: true,
  imports: [
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonButton,
    IonIcon,
    AssetsPipe
  ],
  templateUrl: './media-tile.component.html',
  styleUrl: './media-tile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaTileComponent {
  // Inputs using signals
  readonly showActionButtons = input<boolean>(false);
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly thumbnail = input<string>('');
  readonly item = input<unknown>(null);
  readonly year = input<number | undefined>(undefined);

  // Outputs using output()
  readonly itemSelected = output<unknown>();
  readonly addToPlaylist = output<MediaTileAction>();

  readonly actionsVisible = signal(false);

  toggleActions(): void {
    this.actionsVisible.update(v => !v);
  }

  onItemClick(): void {
    this.itemSelected.emit(this.item());
  }

  onPlayClick(): void {
    this.addToPlaylist.emit({ media: this.item(), playMedia: true });
  }

  onAddClick(): void {
    this.addToPlaylist.emit({ media: this.item(), playMedia: false });
  }
}
