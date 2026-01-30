import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { TileHoverDirective } from '@shared/directives/tile-hover.directive';
import { AssetsPipe } from '@shared/pipes/assets.pipe';

export interface SquareItemAction {
  media: unknown;
  playMedia: boolean;
}

@Component({
  selector: 'app-square-item',
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
  templateUrl: './square-item.component.html',
  styleUrl: './square-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SquareItemComponent {
  // Inputs using signals
  readonly headerActive = input<boolean>(false);
  readonly showFavButtons = input<boolean>(true);
  readonly hoverActive = input<boolean>(true);
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly thumbnail = input<string>('');
  readonly item = input<unknown>(null);
  readonly year = input<number | undefined>(undefined);

  // Outputs using output()
  readonly itemSelected = output<unknown>();
  readonly addToPlaylist = output<SquareItemAction>();

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
