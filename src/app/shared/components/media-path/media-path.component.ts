// ==========================================================================
// SHARED COMPONENT - Media Path
// ==========================================================================
// Muestra la ruta del archivo de un medio. Solo lectura: sirve para saber de
// donde saco el scraper los datos, y la API tampoco permite escribirla.
// ==========================================================================

import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core';
import { IonNote } from '@ionic/angular/standalone';

@Component({
  selector: 'app-media-path',
  standalone: true,
  imports: [IonNote],
  templateUrl: './media-path.component.html',
  styleUrl: './media-path.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaPathComponent {
  readonly path = input<string>('');
  readonly label = input<string>('Archivo');
  /**
   * Marca la ruta como deducida en vez de devuelta por Kodi. Album y artista no
   * tienen `file` en la API: su carpeta solo puede salir de la de sus pistas.
   */
  readonly derived = input<boolean>(false);
  /** Texto alternativo cuando no hay ruta que mostrar. */
  readonly emptyMessage = input<string>('');

  readonly hasPath = computed(() => this.path().trim().length > 0);
  readonly showsEmptyMessage = computed(
    () => !this.hasPath() && this.emptyMessage().length > 0
  );
}
