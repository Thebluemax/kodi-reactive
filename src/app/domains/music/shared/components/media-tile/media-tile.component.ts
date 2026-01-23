import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { TileHoverDirective } from '@shared/directives/tile-hover.directive';
import { AssetsPipe } from '@core/pipes/assets.pipe';

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
    IonCardContent,
    IonButton,
    IonIcon,
    TileHoverDirective,
    AssetsPipe
  ],
  templateUrl: './media-tile.component.html',
  styleUrl: './media-tile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaTileComponent {
  // Inputs using signals
  readonly headerActive = input<boolean>(false);
  readonly showActionButtons = input<boolean>(true);
  readonly hoverActive = input<boolean>(true);
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly thumbnail = input<string>('');
  readonly item = input<unknown>(null);
  readonly year = input<number | undefined>(undefined);

  // Outputs using output()
  readonly itemSelected = output<unknown>();
  readonly addToPlaylist = output<MediaTileAction>();

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
