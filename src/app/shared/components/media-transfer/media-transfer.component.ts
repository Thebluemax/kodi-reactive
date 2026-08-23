// ==========================================================================
// SHARED COMPONENT - Media Transfer
// ==========================================================================
// Exportar la ficha de un medio a JSON y volver a cargarla corregida.
//
// Trabaja sobre el medio que se esta editando, asi que no hay nada que
// emparejar: ni rutas, ni titulos ambiguos, ni indice de biblioteca. Lo
// importado rellena el formulario; guardar sigue siendo un acto aparte.
// ==========================================================================

import { Component, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';

import { NotificationService } from '@shared/services/notification.service';
import { looksLikeXml, parseNfo } from '@shared/utils/nfo-parser';

export type MediaTransferFields = Record<string, unknown>;

@Component({
  selector: 'app-media-transfer',
  standalone: true,
  imports: [IonButton, IonIcon],
  templateUrl: './media-transfer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaTransferComponent {
  private readonly notifications = inject(NotificationService);

  /** Nombre del archivo que se descarga, sin extension. */
  readonly fileName = input<string>('media');
  /** Valores a exportar: las mismas claves que la carga espera encontrar. */
  readonly fields = input.required<MediaTransferFields>();
  readonly disabled = input<boolean>(false);

  readonly imported = output<MediaTransferFields>();

  onExport(): void {
    const blob = new Blob([JSON.stringify(this.fields(), null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${sanitize(this.fileName())}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    // Permite reintentar con el mismo archivo tras corregirlo.
    input.value = '';

    if (!file) {
      return;
    }

    file
      .text()
      .then(text => this.load(text))
      .catch((error: Error) => void this.notifications.error(error.message));
  }

  /**
   * El formato se deduce del contenido y no de la extension: un NFO puede
   * llamarse .nfo o .xml, y un archivo mal nombrado no deberia fallar con un
   * mensaje sobre JSON.
   */
  private load(text: string): void {
    const fields = looksLikeXml(text) ? this.readNfo(text) : this.readJson(text);

    if (!fields) {
      return;
    }

    const known = Object.keys(this.fields());
    const unknown = Object.keys(fields).filter(key => !known.includes(key));

    if (unknown.length > 0) {
      // Avisar en vez de descartarlos en silencio: casi siempre es un nombre
      // de campo mal escrito, y sin aviso parece que la carga no hizo nada.
      void this.notifications.info(
        `Se ignoran campos que este medio no tiene: ${unknown.join(', ')}`
      );
    }

    this.imported.emit(fields);
  }

  private readJson(text: string): MediaTransferFields | null {
    let parsed: unknown;

    try {
      parsed = JSON.parse(text);
    } catch (error) {
      void this.notifications.error(
        `El archivo no es JSON válido: ${(error as Error).message}`
      );
      return null;
    }

    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      void this.notifications.error('Se esperaba un objeto con los campos del medio');
      return null;
    }

    return parsed as MediaTransferFields;
  }

  private readNfo(text: string): MediaTransferFields | null {
    const parsed = parseNfo(text);

    if (!parsed) {
      void this.notifications.error(
        'El archivo no es un NFO válido de Kodi: se esperaba <movie>, <tvshow>, <album>, <artist> o <song>'
      );
      return null;
    }

    return parsed.fields;
  }
}

/** El titulo va al nombre del archivo: fuera lo que el sistema no admite. */
function sanitize(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'media';
}
