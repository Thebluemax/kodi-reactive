// ==========================================================================
// PRESENTATION - Media Import Panel
// ==========================================================================
// Cargar archivo, previsualizar y —solo tras confirmar— aplicar.
//
// Una importacion no tiene deshacer: la previsualizacion no es un adorno, es
// lo unico que separa una correccion masiva de machacar la biblioteca.
// ==========================================================================

import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import {
  AlertController,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSpinner
} from '@ionic/angular/standalone';

import { MediaImportFacade } from '../../../application/media-import.facade';
import {
  FieldChange,
  MediaImportMatch,
  MediaImportUnmatched,
  UnmatchedReason
} from '../../../domain/entities/media-import.entity';
import { NotificationService } from '@shared/services/notification.service';

@Component({
  selector: 'app-media-import-panel',
  standalone: true,
  imports: [IonButton, IonIcon, IonItem, IonLabel, IonList, IonNote, IonSpinner],
  templateUrl: './media-import-panel.component.html',
  styleUrl: './media-import-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaImportPanelComponent {
  private readonly facade = inject(MediaImportFacade);
  private readonly alertController = inject(AlertController);
  private readonly notifications = inject(NotificationService);

  readonly fileName = signal<string>('');

  readonly isLoading = this.facade.isLoading;
  readonly issues = this.facade.issues;
  readonly plan = this.facade.plan;
  readonly results = this.facade.results;

  readonly changed = computed(() => this.plan()?.changed ?? []);
  readonly unchanged = computed(() => this.plan()?.unchanged ?? []);
  readonly unmatched = computed(() => this.plan()?.unmatched ?? []);
  readonly canApply = computed(() => this.changed().length > 0 && !this.isLoading());
  readonly failedCount = this.facade.failedCount;
  readonly appliedCount = computed(
    () => this.results().filter(result => !result.error).length
  );

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.fileName.set(file.name);

    file
      .text()
      .then(text => this.facade.preview(text).subscribe())
      .catch((error: Error) => void this.notifications.error(error.message));

    // Permite volver a elegir el mismo archivo tras corregirlo.
    input.value = '';
  }

  async onApply(): Promise<void> {
    const total = this.changed().length;

    const alert = await this.alertController.create({
      header: 'Aplicar los cambios',
      message:
        `Se van a modificar ${total} elementos de la biblioteca de Kodi. ` +
        'No hay forma de deshacerlo.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Aplicar',
          role: 'destructive',
          handler: () => {
            this.apply();
          }
        }
      ]
    });

    await alert.present();
  }

  onDiscard(): void {
    this.facade.reset();
    this.fileName.set('');
  }

  labelOf(match: MediaImportMatch): string {
    return match.item.label || match.entry.matchValue;
  }

  describeChange(change: FieldChange): string {
    return `${change.field}: ${format(change.before)} → ${format(change.after)}`;
  }

  describeUnmatched(unmatched: MediaImportUnmatched): string {
    return unmatched.reason === UnmatchedReason.Ambiguous
      ? `Coincide con ${unmatched.candidates.length} elementos: no se toca ninguno`
      : 'No se ha encontrado en la biblioteca';
  }

  private apply(): void {
    this.facade.apply().subscribe(results => {
      const failed = results.filter(result => result.error).length;

      if (failed === 0) {
        void this.notifications.success(`${results.length} elementos actualizados`);
        return;
      }

      void this.notifications.error(
        `${results.length - failed} actualizados, ${failed} con error`
      );
    });
  }
}

function format(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : '—';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}
