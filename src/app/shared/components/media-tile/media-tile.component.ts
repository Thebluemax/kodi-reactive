import { Component, ChangeDetectionStrategy, computed, input, output, signal } from '@angular/core';
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
  /**
   * Como encuadrar la caratula en la tarjeta, que es cuadrada.
   *
   * `cover` la amplia hasta llenarla, que va bien con las caratulas cuadradas
   * de album. `height` la muestra entera de arriba abajo y centrada, que es lo
   * que necesitan los carteles verticales de pelicula y serie: con `cover` se
   * recortan, y sin posicion se recortan ademas desde una esquina.
   */
  readonly imageFit = input<'cover' | 'height'>('cover');

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

  readonly backgroundSize = computed(() =>
    this.imageFit() === 'height' ? 'auto 100%' : 'cover'
  );

  /**
   * `null` deja el estilo sin poner, que es como estaba: en modo `cover` una
   * caratula cuadrada llena la tarjeta y centrarla no cambiaria nada, pero una
   * que no lo sea si se veria distinta.
   */
  readonly backgroundPosition = computed(() =>
    this.imageFit() === 'height' ? 'center' : null
  );
}
