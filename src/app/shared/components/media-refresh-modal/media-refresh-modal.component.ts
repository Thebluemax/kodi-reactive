// ==========================================================================
// SHARED COMPONENT - Media Refresh Modal
// ==========================================================================
// Pide los datos con los que volver a scrapear un medio.
//
// No es un ion-alert porque los alerts de Ionic toman el tipo del primer input
// y aplican ese a todos: mezclar texto con checkbox deja las casillas
// renderizadas como cajas de texto sin etiqueta, y sin aviso.
// ==========================================================================

import {
  Component,
  ChangeDetectionStrategy,
  computed,
  effect,
  input,
  output,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonNote,
  IonTitle,
  IonToggle,
  IonToolbar
} from '@ionic/angular/standalone';

export interface MediaRefreshRequest {
  readonly title: string;
  readonly year: string;
  readonly uniqueId: string;
  readonly ignoreNfo: boolean;
  readonly refreshEpisodes: boolean;
}

@Component({
  selector: 'app-media-refresh-modal',
  standalone: true,
  imports: [
    FormsModule,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonNote,
    IonTitle,
    IonToggle,
    IonToolbar
  ],
  templateUrl: './media-refresh-modal.component.html',
  styleUrl: './media-refresh-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaRefreshModalComponent {
  /** Referencia estable, como en el modal de edicion. */
  readonly initial = input.required<MediaRefreshRequest>();
  /** Año e identificador solo tienen sentido donde desambiguan. */
  readonly showYear = input<boolean>(false);
  readonly showUniqueId = input<boolean>(false);
  readonly showRefreshEpisodes = input<boolean>(false);
  readonly uniqueIdLabel = input<string>('IMDb');
  readonly saving = input<boolean>(false);

  readonly confirmed = output<MediaRefreshRequest>();
  readonly cancelled = output<void>();

  readonly title = signal<string>('');
  readonly year = signal<string>('');
  readonly uniqueId = signal<string>('');
  readonly ignoreNfo = signal<boolean>(false);
  readonly refreshEpisodes = signal<boolean>(false);

  constructor() {
    effect(() => {
      const initial = this.initial();

      this.title.set(initial.title);
      this.year.set(initial.year);
      this.uniqueId.set(initial.uniqueId);
      this.ignoreNfo.set(initial.ignoreNfo);
      this.refreshEpisodes.set(initial.refreshEpisodes);
    });
  }

  /** Lo que Kodi acabara buscando, para que no haya sorpresas. */
  readonly searchPreview = computed(() => {
    const title = this.title().trim();
    const year = this.year().trim();

    if (title.length === 0) {
      return 'Kodi lo deducirá del nombre del archivo';
    }

    return year.length > 0 && !title.includes(`(${year})`)
      ? `${title} (${year})`
      : title;
  });

  onConfirm(): void {
    this.confirmed.emit({
      title: this.title().trim(),
      year: this.year().trim(),
      uniqueId: this.uniqueId().trim(),
      ignoreNfo: this.ignoreNfo(),
      refreshEpisodes: this.refreshEpisodes()
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
