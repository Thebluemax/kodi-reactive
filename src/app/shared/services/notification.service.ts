// ==========================================================================
// SHARED - Notification Service
// ==========================================================================
// Punto unico para los toasts de la aplicacion. Antes cada componente creaba
// el suyo con ToastController, cada uno con su duracion, color y posicion.
// ==========================================================================

import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

/** Los errores llevan mas tiempo en pantalla: hay que leerlos y decidir. */
const DURATION_MS = {
  success: 2500,
  error: 5000,
  info: 3000,
} as const;

const ICONS = {
  success: 'checkmark-circle-outline',
  error: 'alert-circle-outline',
  info: 'information-circle-outline',
} as const;

const COLORS = {
  success: 'success',
  error: 'danger',
  info: 'medium',
} as const;

type NotificationKind = keyof typeof DURATION_MS;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly toastController = inject(ToastController);

  success(message: string): Promise<void> {
    return this.present('success', message);
  }

  error(message: string): Promise<void> {
    return this.present('error', message);
  }

  info(message: string): Promise<void> {
    return this.present('info', message);
  }

  private async present(kind: NotificationKind, message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color: COLORS[kind],
      icon: ICONS[kind],
      duration: DURATION_MS[kind],
      position: 'bottom',
    });

    await toast.present();
  }
}
