// ==========================================================================
// PRESENTATION - Settings Page Component
// ==========================================================================

import { Component, inject, effect, ChangeDetectionStrategy } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonIcon,
  IonRadioGroup,
  IonRadio,
  IonInput,
  IonButton,
  IonSpinner,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { ThemeService, ThemePreference } from '@shared/services/theme.service';
import { KodiConfigService } from '@shared/services/kodi-config.service';
import { LibraryFacade } from '@domains/library/application/library.facade';
import {
  LibraryType,
  LibraryOperation,
} from '@domains/library/domain/entities/library-type.entity';

const LIBRARY_LABELS: Record<LibraryType, string> = {
  [LibraryType.Audio]: 'música',
  [LibraryType.Video]: 'vídeo',
};

const OPERATION_LABELS: Record<LibraryOperation, string> = {
  [LibraryOperation.Scan]: 'Escaneo',
  [LibraryOperation.Clean]: 'Limpieza',
};

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonIcon,
    IonRadioGroup,
    IonRadio,
    IonInput,
    IonButton,
    IonSpinner,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent {
  readonly themeService = inject(ThemeService);
  readonly config = inject(KodiConfigService);
  readonly library = inject(LibraryFacade);

  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);

  // Expuesto al template
  readonly LibraryType = LibraryType;

  constructor() {
    effect(() => {
      const error = this.library.lastError();

      if (error) {
        void this.showToast(error, 'danger');
        this.library.clearError();
      }
    });

    effect(() => {
      const finished = this.library.lastFinished();

      if (finished) {
        const operation = OPERATION_LABELS[finished.operation];
        const target = LIBRARY_LABELS[finished.type];

        void this.showToast(`${operation} de ${target} finalizada`, 'success');
        this.library.clearFinished();
      }
    });
  }

  // El WebSocket solo se mantiene abierto mientras la página está visible
  ionViewWillEnter(): void {
    this.library.connect();
  }

  ionViewWillLeave(): void {
    this.library.disconnect();
  }

  onThemeChange(event: CustomEvent): void {
    this.themeService.setTheme(event.detail.value as ThemePreference);
  }

  onWsPortChange(event: CustomEvent): void {
    const port = parseInt(event.detail.value as string, 10);
    if (!isNaN(port) && port > 0 && port <= 65535) {
      this.config.setWsPort(port);
    }
  }

  onScan(type: LibraryType): void {
    this.library.scan(type);
  }

  async onClean(type: LibraryType): Promise<void> {
    const alert = await this.alertController.create({
      header: `Limpiar biblioteca de ${LIBRARY_LABELS[type]}`,
      message:
        'Se eliminarán de la base de datos los elementos cuyos archivos ya no existan. ' +
        'Si una unidad de red está desconectada, perderás esas entradas.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Limpiar',
          role: 'destructive',
          handler: () => {
            this.library.clean(type);
          },
        },
      ],
    });

    await alert.present();
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 3000,
      position: 'bottom',
    });

    await toast.present();
  }
}
