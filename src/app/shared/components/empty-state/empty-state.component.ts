import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  input,
  output
} from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';

import { GlobalSearchService } from '@shared/services/global-search.service';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IonButton, IonIcon],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  readonly globalSearch = inject(GlobalSearchService);

  readonly icon = input<string>('search');
  readonly message = input<string>('No hay nada que mostrar');
  /** Linea secundaria opcional, para sugerir una accion al usuario */
  readonly hint = input<string>('');
  /**
   * Motivo por el que la carga fallo, si fallo.
   *
   * Sin esto una lista vacia por un fallo de conexion se anunciaba como
   * biblioteca vacia, que es mentira y parece un fallo del add-on.
   */
  readonly error = input<string>('');

  /**
   * Distingue "la biblioteca esta vacia" de "el filtro no encontro nada".
   * Se exige isSearchVisible porque en las secciones sin buscador el termino
   * no aplica, aunque el servicio conserve un valor.
   */
  readonly isFiltered = computed(
    () =>
      !this.hasError() &&
      this.globalSearch.isSearchVisible() &&
      this.globalSearch.debouncedSearchTerm().length > 0
  );

  /** Reintentar la carga que fallo. */
  readonly retry = output<void>();

  /** El fallo manda: sin datos no se puede afirmar que no haya nada. */
  readonly hasError = computed(() => this.error().length > 0);

  onClearSearch(): void {
    this.globalSearch.clearSearch();
  }

  onRetry(): void {
    this.retry.emit();
  }
}
