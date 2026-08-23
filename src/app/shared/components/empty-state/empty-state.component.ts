import { Component, ChangeDetectionStrategy, computed, inject, input } from '@angular/core';
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
   * Distingue "la biblioteca esta vacia" de "el filtro no encontro nada".
   * Se exige isSearchVisible porque en las secciones sin buscador el termino
   * no aplica, aunque el servicio conserve un valor.
   */
  readonly isFiltered = computed(
    () =>
      this.globalSearch.isSearchVisible() &&
      this.globalSearch.debouncedSearchTerm().length > 0
  );

  onClearSearch(): void {
    this.globalSearch.clearSearch();
  }
}
